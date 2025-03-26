"use client";

import { useState, useRef, useEffect } from "react";
import { Howl, Howler } from "howler";
import {
  SOUND_CATEGORIES,
  SOUND_URLS,
  SoundCategory,
} from "@/lib/sound-data";

export default function useFocusSoundMixer() {
  const [natureVolume, setNatureVolume] = useState(50);
  const [whiteNoiseVolume, setWhiteNoiseVolume] = useState(30);
  const [melodyVolume, setMelodyVolume] = useState(20);
  const [masterVolume, setMasterVolume] = useState(80);

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SoundCategory>("nature");
  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);

  const [selectedTracks, setSelectedTracks] = useState({
    nature: SOUND_CATEGORIES.nature[0].id,
    whiteNoise: SOUND_CATEGORIES.whiteNoise[0].id,
    melody: SOUND_CATEGORIES.melody[0].id,
  });

  const [audioStatus, setAudioStatus] = useState({
    nature: { loaded: false, error: null as string | null },
    whiteNoise: { loaded: false, error: null as string | null },
    melody: { loaded: false, error: null as string | null },
  });

  const natureHowlRef = useRef<Howl | null>(null);
  const whiteNoiseHowlRef = useRef<Howl | null>(null);
  const melodyHowlRef = useRef<Howl | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!Howler) return;

    const tryUnlock = () => {
      if (Howler.ctx?.state !== "running") {
        Howler.ctx.resume().then(() => {
          setAudioContextUnlocked(true);
        });
      } else {
        setAudioContextUnlocked(true);
      }
    };

    tryUnlock();

    const userEvents = ["click", "touchstart", "keydown"];
    const handleUserInteraction = () => {
      tryUnlock();
      userEvents.forEach((evt) =>
        document.removeEventListener(evt, handleUserInteraction)
      );
    };

    userEvents.forEach((evt) => {
      document.addEventListener(evt, handleUserInteraction, { once: true });
    });

    return () => {
      userEvents.forEach((evt) =>
        document.removeEventListener(evt, handleUserInteraction)
      );
    };
  }, [isMounted]);

  function stopAllSounds() {
    [natureHowlRef, whiteNoiseHowlRef, melodyHowlRef].forEach((ref) => {
      if (ref.current) {
        ref.current.stop();
        ref.current.unload();
        ref.current = null;
      }
    });
  }

  function createHowl(
    sources: string[],
    category: SoundCategory,
    onSuccess: (howl: Howl) => void
  ) {
    if (!isMounted || !Howl) return null;

    setAudioStatus((prev) => ({
      ...prev,
      [category]: { loaded: false, error: null },
    }));

    const howl = new Howl({
      src: sources,
      html5: true,
      loop: true,
      preload: true,
      volume: 0,
      format: ["mp3", "wav", "ogg"],
      onload: () => {
        setAudioStatus((prev) => ({
          ...prev,
          [category]: { loaded: true, error: null },
        }));
        onSuccess(howl);
      },
      onloaderror: () => {
        setAudioStatus((prev) => ({
          ...prev,
          [category]: { loaded: false, error: "Failed to load audio" },
        }));
      },
      onplayerror: () => {
        if (Howler.ctx?.state !== "running") {
          Howler.ctx
            .resume()
            .then(() => {
              setAudioContextUnlocked(true);
              setTimeout(() => {
                howl.play();
              }, 100);
            })
            .catch(() => {
              setAudioStatus((prev) => ({
                ...prev,
                [category]: {
                  ...prev[category],
                  error:
                    "Please interact with the page first to enable audio playback",
                },
              }));
            });
        } else {
          setAudioStatus((prev) => ({
            ...prev,
            [category]: { ...prev[category], error: "Failed to play audio" },
          }));
        }
      },
    });

    return howl;
  }

  function updateSoundVolume(category: SoundCategory, howl?: Howl) {
    if (!isMounted) return;

    const masterVol = masterVolume / 100;
    let baseVolume = 0;
    let targetHowl = howl;

    switch (category) {
      case "nature":
        baseVolume = (natureVolume / 100) * masterVol;
        if (!targetHowl && natureHowlRef.current) {
          targetHowl = natureHowlRef.current;
        }
        break;
      case "whiteNoise":
        baseVolume = (whiteNoiseVolume / 100) * masterVol;
        if (!targetHowl && whiteNoiseHowlRef.current) {
          targetHowl = whiteNoiseHowlRef.current;
        }
        break;
      case "melody":
        baseVolume = (melodyVolume / 100) * masterVol;
        if (!targetHowl && melodyHowlRef.current) {
          targetHowl = melodyHowlRef.current;
        }
        break;
    }

    if (targetHowl) {
      targetHowl.volume(baseVolume);
    }
  }

  useEffect(() => {
    if (!isMounted) return;
    if (!isPlaying) {
      stopAllSounds();
      return;
    }

    stopAllSounds();

    const loadAudio = (
      category: SoundCategory,
      trackId: string,
      ref: React.MutableRefObject<Howl | null>
    ) => {
      const soundData = SOUND_URLS[category][trackId];
      if (!soundData) {
        setAudioStatus((prev) => ({
          ...prev,
          [category]: {
            loaded: false,
            error: `No URL found for ${trackId}`,
          },
        }));
        return;
      }
      const sources = [];
      if (soundData.local) sources.push(soundData.local);
      if (soundData.fallback) sources.push(soundData.fallback);
      if (soundData.alternate) sources.push(soundData.alternate);

      const howlInstance = createHowl(sources, category, (howl) => {
        updateSoundVolume(category, howl);
        if (category === activeCategory && audioContextUnlocked) {
          howl.play();
        }
      });
      ref.current = howlInstance;
    };

    loadAudio("nature", selectedTracks.nature, natureHowlRef);
    loadAudio("whiteNoise", selectedTracks.whiteNoise, whiteNoiseHowlRef);
    loadAudio("melody", selectedTracks.melody, melodyHowlRef);
  }, [isMounted, isPlaying, selectedTracks, activeCategory, audioContextUnlocked]);

  useEffect(() => {
    if (!isMounted) return;
    updateSoundVolume("nature");
    updateSoundVolume("whiteNoise");
    updateSoundVolume("melody");
  }, [isMounted, natureVolume, whiteNoiseVolume, melodyVolume, masterVolume]);

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleTabChange = (category: SoundCategory) => {
    if (category !== activeCategory) {
      setActiveCategory(category);
    }
  };

  const handleTrackChange = (category: SoundCategory, trackId: string) => {
    if (selectedTracks[category] === trackId) {
      if (category !== activeCategory) {
        setActiveCategory(category);
      }
      return;
    }
    setSelectedTracks((prev) => ({ ...prev, [category]: trackId }));
    setAudioStatus((prev) => ({
      ...prev,
      [category]: { loaded: false, error: null },
    }));
    setActiveCategory(category);
  };

  return {
    natureVolume,
    setNatureVolume,
    whiteNoiseVolume,
    setWhiteNoiseVolume,
    melodyVolume,
    setMelodyVolume,
    masterVolume,
    setMasterVolume,
    isPlaying,
    togglePlayback,
    activeCategory,
    handleTabChange,
    audioContextUnlocked,
    selectedTracks,
    handleTrackChange,
    audioStatus,
  };
}
