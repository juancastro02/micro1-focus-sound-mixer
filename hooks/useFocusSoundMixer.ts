"use client";
import { useState, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import { SOUND_URLS, SOUND_CATEGORIES, SoundCategory } from "@/lib/sound-data";

interface AudioStatus {
  loaded: boolean;
  error: string | null;
}

export default function useFocusSoundMixer() {
  const [natureVolume, setNatureVolume] = useState(50);
  const [whiteNoiseVolume, setWhiteNoiseVolume] = useState(30);
  const [melodyVolume, setMelodyVolume] = useState(20);
  const [masterVolume, setMasterVolume] = useState(80);

  const [isNaturePlaying, setIsNaturePlaying] = useState(false);
  const [isWhiteNoisePlaying, setIsWhiteNoisePlaying] = useState(false);
  const [isMelodyPlaying, setIsMelodyPlaying] = useState(false);

  const [selectedTracks, setSelectedTracks] = useState({
    nature: SOUND_CATEGORIES.nature[0].id,
    whiteNoise: SOUND_CATEGORIES.whiteNoise[0].id,
    melody: SOUND_CATEGORIES.melody[0].id,
  });

  const [audioStatus, setAudioStatus] = useState<{
    [key in SoundCategory]: AudioStatus;
  }>({
    nature: { loaded: false, error: null },
    whiteNoise: { loaded: false, error: null },
    melody: { loaded: false, error: null },
  });

  const natureHowlRef = useRef<Howl | null>(null);
  const whiteNoiseHowlRef = useRef<Howl | null>(null);
  const melodyHowlRef = useRef<Howl | null>(null);

  const [audioContextUnlocked, setAudioContextUnlocked] = useState(false);
  useEffect(() => {
    if (Howler.ctx?.state !== "running") {
      Howler.ctx.resume().then(() => setAudioContextUnlocked(true));
    } else {
      setAudioContextUnlocked(true);
    }
    const unlockEvents = ["click", "touchstart", "keydown"];
    const unlockHandler = () => {
      if (Howler.ctx?.state !== "running") {
        Howler.ctx
          .resume()
          .then(() => setAudioContextUnlocked(true))
          .catch(() => null);
      } else {
        setAudioContextUnlocked(true);
      }
      unlockEvents.forEach((evt) =>
        document.removeEventListener(evt, unlockHandler)
      );
    };
    unlockEvents.forEach((evt) =>
      document.addEventListener(evt, unlockHandler, { once: true })
    );

    return () => {
      unlockEvents.forEach((evt) =>
        document.removeEventListener(evt, unlockHandler)
      );
    };
  }, []);


  function getRef(category: SoundCategory) {
    if (category === "nature") return natureHowlRef;
    if (category === "whiteNoise") return whiteNoiseHowlRef;
    return melodyHowlRef;
  }

  function createHowl(category: SoundCategory, trackId: string): Howl | null {
    const soundData = SOUND_URLS[category][trackId];
    if (!soundData) {
      setAudioStatus((prev) => ({
        ...prev,
        [category]: {
          loaded: false,
          error: `No URL found for ${trackId}`,
        },
      }));
      return null;
    }

    const srcArr: string[] = [];
    if (soundData.local) srcArr.push(soundData.local);
    if (soundData.fallback) srcArr.push(soundData.fallback);
    if (soundData.alternate) srcArr.push(soundData.alternate);

    setAudioStatus((prev) => ({
      ...prev,
      [category]: { loaded: false, error: null },
    }));

    const newHowl = new Howl({
      src: srcArr,
      loop: true,
      html5: true,
      volume: 0,
      onload: () => {
        setAudioStatus((prev) => ({
          ...prev,
          [category]: { loaded: true, error: null },
        }));
        updateVolume(category, newHowl);
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
              setTimeout(() => newHowl.play(), 100);
            })
            .catch(() => {
              setAudioStatus((prev) => ({
                ...prev,
                [category]: {
                  ...prev[category],
                  error: "Please interact with the page to enable audio",
                },
              }));
            });
        } else {
          setAudioStatus((prev) => ({
            ...prev,
            [category]: {
              ...prev[category],
              error: "Failed to play audio",
            },
          }));
        }
      },
    });

    return newHowl;
  }

  function updateVolume(category: SoundCategory, howl?: Howl) {
    const masterMult = masterVolume / 100;
    let catVol = 0;

    switch (category) {
      case "nature":
        catVol = natureVolume / 100;
        break;
      case "whiteNoise":
        catVol = whiteNoiseVolume / 100;
        break;
      case "melody":
        catVol = melodyVolume / 100;
        break;
    }

    const refHowl = howl || getRef(category).current;
    if (refHowl) {
      refHowl.volume(catVol * masterMult);
    }
  }

  function stopAndUnload(category: SoundCategory) {
    const ref = getRef(category);
    if (ref.current) {
      ref.current.stop();
      ref.current.unload();
      ref.current = null;
    }
  }

  useEffect(() => {
    const ref = natureHowlRef;
    if (isNaturePlaying) {
      if (!ref.current) {
        ref.current = createHowl("nature", selectedTracks.nature);
        ref.current?.play();
      } else {
        ref.current.play();
      }
    } else {
      stopAndUnload("nature");
    }
  }, [isNaturePlaying, selectedTracks.nature]);

  useEffect(() => {
    const ref = whiteNoiseHowlRef;
    if (isWhiteNoisePlaying) {
      if (!ref.current) {
        ref.current = createHowl("whiteNoise", selectedTracks.whiteNoise);
        ref.current?.play();
      } else {
        ref.current.play();
      }
    } else {
      stopAndUnload("whiteNoise");
    }
  }, [isWhiteNoisePlaying, selectedTracks.whiteNoise]);

  useEffect(() => {
    const ref = melodyHowlRef;
    if (isMelodyPlaying) {
      if (!ref.current) {
        ref.current = createHowl("melody", selectedTracks.melody);
        ref.current?.play();
      } else {
        ref.current.play();
      }
    } else {
      stopAndUnload("melody");
    }
  }, [isMelodyPlaying, selectedTracks.melody]);

  useEffect(() => {
    updateVolume("nature");
    updateVolume("whiteNoise");
    updateVolume("melody");
  }, [natureVolume, whiteNoiseVolume, melodyVolume, masterVolume]);

  function handleTrackChange(category: SoundCategory, trackId: string) {
    setSelectedTracks((prev) => ({ ...prev, [category]: trackId }));
    setAudioStatus((prev) => ({
      ...prev,
      [category]: { loaded: false, error: null },
    }));
  }

  return {
    natureVolume,
    setNatureVolume,
    whiteNoiseVolume,
    setWhiteNoiseVolume,
    melodyVolume,
    setMelodyVolume,
    masterVolume,
    setMasterVolume,

    isNaturePlaying,
    setIsNaturePlaying,
    isWhiteNoisePlaying,
    setIsWhiteNoisePlaying,
    isMelodyPlaying,
    setIsMelodyPlaying,

    selectedTracks,
    handleTrackChange,

    audioContextUnlocked,
    audioStatus,
  };
}
