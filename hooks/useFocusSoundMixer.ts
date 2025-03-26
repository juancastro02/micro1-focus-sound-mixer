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

  function getRef(category: SoundCategory) {
    if (category === "nature") return natureHowlRef;
    if (category === "whiteNoise") return whiteNoiseHowlRef;
    return melodyHowlRef;
  }

  useEffect(() => {
    if (Howler.ctx?.state !== "running") {
      Howler.ctx.resume().then(() => setAudioContextUnlocked(true));
    } else {
      setAudioContextUnlocked(true);
    }
    const events = ["click", "touchstart", "keydown"];
    const handler = () => {
      if (Howler.ctx?.state !== "running") {
        Howler.ctx
          .resume()
          .then(() => setAudioContextUnlocked(true))
          .catch(() => null);
      } else {
        setAudioContextUnlocked(true);
      }
      events.forEach((e) => document.removeEventListener(e, handler));
    };
    events.forEach((e) => document.addEventListener(e, handler, { once: true }));
    return () => {
      events.forEach((e) => document.removeEventListener(e, handler));
    };
  }, []);

  function createHowl(cat: SoundCategory, trackId: string): Howl | null {
    const data = SOUND_URLS[cat][trackId];
    if (!data) {
      setAudioStatus((p) => ({
        ...p,
        [cat]: { loaded: false, error: "No URL found for track" },
      }));
      return null;
    }
    const sources: string[] = [];
    if (data.local) sources.push(data.local);
    if (data.fallback) sources.push(data.fallback);
    if (data.alternate) sources.push(data.alternate);
    setAudioStatus((p) => ({
      ...p,
      [cat]: { loaded: false, error: null },
    }));
    const masterMultiplier = masterVolume / 100;
    let categoryVolume = 0;
    if (cat === "nature") categoryVolume = natureVolume / 100;
    if (cat === "whiteNoise") categoryVolume = whiteNoiseVolume / 100;
    if (cat === "melody") categoryVolume = melodyVolume / 100;
    const initialVolume = categoryVolume * masterMultiplier;
    const howl = new Howl({
      src: sources,
      loop: true,
      html5: true,
      volume: initialVolume,
      onload: () => {
        setAudioStatus((p) => ({
          ...p,
          [cat]: { loaded: true, error: null },
        }));
        updateVolume(cat, howl);
      },
      onloaderror: () => {
        setAudioStatus((p) => ({
          ...p,
          [cat]: { loaded: false, error: "Failed to load audio" },
        }));
      },
      onplayerror: () => {
        if (Howler.ctx?.state !== "running") {
          Howler.ctx
            .resume()
            .then(() => {
              setAudioContextUnlocked(true);
              updateVolume(cat, howl);
              setTimeout(() => howl.play(), 100);
            })
            .catch(() => {
              setAudioStatus((p) => ({
                ...p,
                [cat]: {
                  ...p[cat],
                  error: "Interact with the page to enable audio",
                },
              }));
            });
        } else {
          setAudioStatus((p) => ({
            ...p,
            [cat]: {
              ...p[cat],
              error: "Failed to play audio",
            },
          }));
        }
      },
    });
    return howl;
  }

  function updateVolume(cat: SoundCategory, howl?: Howl) {
    const masterMult = masterVolume / 100;
    let catVol = 0;
    
    switch(cat) {
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
    
    const finalVolume = Math.min(1, Math.max(0, catVol * masterMult));
    
    if (howl && typeof howl.volume === 'function') {
      howl.volume(finalVolume);
      return;
    }
    
    const ref = getRef(cat);
    if (ref.current && typeof ref.current.volume === 'function') {
      ref.current.volume(finalVolume);
    }
  }

  function stopAndUnload(cat: SoundCategory) {
    const ref = getRef(cat);
    if (ref.current) {
      ref.current.stop();
      ref.current.unload();
      ref.current = null;
    }
  }

  useEffect(() => {
    const ref = natureHowlRef;
    const track = selectedTracks.nature;
    if (isNaturePlaying) {
      if (!ref.current) {
        ref.current = createHowl("nature", track);
        if (ref.current && audioContextUnlocked) {
          updateVolume("nature", ref.current);
          ref.current.play();
        }
      } else if (!ref.current.playing()) {
        updateVolume("nature", ref.current);
        ref.current.play();
      }
    } else {
      if (ref.current && ref.current.playing()) {
        ref.current.pause();
      }
    }
  }, [isNaturePlaying, audioContextUnlocked, selectedTracks.nature]);

  useEffect(() => {
    const ref = whiteNoiseHowlRef;
    const track = selectedTracks.whiteNoise;
    if (isWhiteNoisePlaying) {
      if (!ref.current) {
        ref.current = createHowl("whiteNoise", track);
        if (ref.current && audioContextUnlocked) {
          updateVolume("whiteNoise", ref.current);
          ref.current.play();
        }
      } else if (!ref.current.playing()) {
        updateVolume("whiteNoise", ref.current);
        ref.current.play();
      }
    } else {
      if (ref.current && ref.current.playing()) {
        ref.current.pause();
      }
    }
  }, [isWhiteNoisePlaying, audioContextUnlocked, selectedTracks.whiteNoise]);

  useEffect(() => {
    const ref = melodyHowlRef;
    const track = selectedTracks.melody;
    if (isMelodyPlaying) {
      if (!ref.current) {
        ref.current = createHowl("melody", track);
        if (ref.current && audioContextUnlocked) {
          updateVolume("melody", ref.current);
          ref.current.play();
        }
      } else if (!ref.current.playing()) {
        updateVolume("melody", ref.current);
        ref.current.play();
      }
    } else {
      if (ref.current && ref.current.playing()) {
        ref.current.pause();
      }
    }
  }, [isMelodyPlaying, audioContextUnlocked, selectedTracks.melody]);

  useEffect(() => {
    const ref = natureHowlRef;
    const wasPlaying = isNaturePlaying;
    if (ref.current) {
      ref.current.stop();
      ref.current.unload();
      ref.current = null;
      if (wasPlaying) {
        const newHowl = createHowl("nature", selectedTracks.nature);
        if (newHowl && audioContextUnlocked) {
          ref.current = newHowl;
          updateVolume("nature", newHowl);
          ref.current.play();
        }
      }
    }
  }, [selectedTracks.nature]);

  useEffect(() => {
    const ref = whiteNoiseHowlRef;
    const wasPlaying = isWhiteNoisePlaying;
    if (ref.current) {
      ref.current.stop();
      ref.current.unload();
      ref.current = null;
      if (wasPlaying) {
        const newHowl = createHowl("whiteNoise", selectedTracks.whiteNoise);
        if (newHowl && audioContextUnlocked) {
          ref.current = newHowl;
          updateVolume("whiteNoise", newHowl);
          ref.current.play();
        }
      }
    }
  }, [selectedTracks.whiteNoise]);

  useEffect(() => {
    const ref = melodyHowlRef;
    const wasPlaying = isMelodyPlaying;
    if (ref.current) {
      ref.current.stop();
      ref.current.unload();
      ref.current = null;
      if (wasPlaying) {
        const newHowl = createHowl("melody", selectedTracks.melody);
        if (newHowl && audioContextUnlocked) {
          ref.current = newHowl;
          updateVolume("melody", newHowl);
          ref.current.play();
        }
      }
    }
  }, [selectedTracks.melody]);

  useEffect(() => {
    if (natureHowlRef.current) {
      updateVolume("nature");
    }
  }, [natureVolume, masterVolume]);

  useEffect(() => {
    if (whiteNoiseHowlRef.current) {
      updateVolume("whiteNoise");
    }
  }, [whiteNoiseVolume, masterVolume]);

  useEffect(() => {
    if (melodyHowlRef.current) {
      updateVolume("melody");
    }
  }, [melodyVolume, masterVolume]);

  useEffect(() => {
    if (natureHowlRef.current) {
      updateVolume("nature");
    }
    if (whiteNoiseHowlRef.current) {
      updateVolume("whiteNoise");
    }
    if (melodyHowlRef.current) {
      updateVolume("melody");
    }
  }, [masterVolume]);

  function handleTrackChange(cat: SoundCategory, trackId: string) {
    if (selectedTracks[cat] === trackId) return;
    setSelectedTracks((p) => ({ ...p, [cat]: trackId }));
    setAudioStatus((pr) => ({
      ...pr,
      [cat]: { loaded: false, error: null },
    }));
  }

  useEffect(() => {
    return () => {
      stopAndUnload("nature");
      stopAndUnload("whiteNoise");
      stopAndUnload("melody");
    };
  }, []);

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
