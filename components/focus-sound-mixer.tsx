"use client";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Volume2,
  VolumeX,
  Play,
  Leaf,
  Wind,
  Music,
  Droplets,
  Cloud,
  Waves,
  Radio,
  Piano,
  Headphones,
  Pause,
} from "lucide-react";

let Howler: any = null;
let Howl: any = null;

if (typeof window !== "undefined") {
  try {
    const howler = require("howler");
    Howler = howler.Howler;
    Howl = howler.Howl;
  } catch (e) {
    console.error("Error loading Howler:", e);
  }
}

const SOUND_CATEGORIES = {
  nature: [
    { id: "rain", name: "Rain", icon: <Droplets className="h-3.5 w-3.5 mr-1" /> },
    { id: "forest", name: "Forest", icon: <Leaf className="h-3.5 w-3.5 mr-1" /> },
    { id: "ocean", name: "Ocean", icon: <Waves className="h-3.5 w-3.5 mr-1" /> },
  ],
  whiteNoise: [
    { id: "white", name: "White", icon: <Cloud className="h-3.5 w-3.5 mr-1" /> },
    { id: "brown", name: "Brown", icon: <Wind className="h-3.5 w-3.5 mr-1" /> },
    { id: "pink", name: "Pink", icon: <Radio className="h-3.5 w-3.5 mr-1" /> },
  ],
  melody: [
    { id: "ambient", name: "Ambient", icon: <Music className="h-3.5 w-3.5 mr-1" /> },
    { id: "piano", name: "Piano", icon: <Piano className="h-3.5 w-3.5 mr-1" /> },
    { id: "lofi", name: "Lo-Fi", icon: <Headphones className="h-3.5 w-3.5 mr-1" /> },
  ],
};

interface SoundSource {
  local: string;
  fallback?: string;
  alternate?: string;
}

interface CategorySounds {
  [key: string]: SoundSource;
}

const SOUND_URLS: {
  nature: CategorySounds;
  whiteNoise: CategorySounds;
  melody: CategorySounds;
} = {
  nature: {
    rain: {
      local: "/sounds/rain.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3",
      alternate:
        "https://assets.mixkit.co/sfx/download/mixkit-rain-and-thunder-storm-2390.wav",
    },
    forest: {
      local: "/sounds/forest.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3",
      alternate:
        "https://assets.mixkit.co/sfx/download/mixkit-forest-birds-chirping-1211.wav",
    },
    ocean: {
      local: "/sounds/ocean.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-ocean-waves-1178.mp3",
      alternate:
        "https://assets.mixkit.co/sfx/download/mixkit-sea-waves-1196.wav",
    },
  },
  whiteNoise: {
    white: {
      local: "/sounds/white.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-white-noise-ambience-loop-1236.mp3",
    },
    brown: {
      local: "/sounds/brown.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-calm-forest-ambience-loop-1216.mp3",
    },
    pink: {
      local: "/sounds/pink.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3",
    },
  },
  melody: {
    ambient: {
      local: "/sounds/ambient.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-ethereal-fairy-win-sound-2019.mp3",
    },
    piano: {
      local: "/sounds/piano.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-piano-zen-notification-919.mp3",
    },
    lofi: {
      local: "/sounds/lofi.mp3",
      fallback:
        "https://assets.mixkit.co/sfx/preview/mixkit-tech-house-vibes-130.mp3",
    },
  },
};

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [m, setM] = useState(false);
  useEffect(() => {
    setM(true);
  }, []);
  if (!m) return null;
  return <>{children}</>;
};

export default function FocusSoundMixer() {
  const [natureVolume, setNatureVolume] = useState(50);
  const [whiteNoiseVolume, setWhiteNoiseVolume] = useState(30);
  const [melodyVolume, setMelodyVolume] = useState(20);
  const [masterVolume, setMasterVolume] = useState(80);
  const [playingStates, setPlayingStates] = useState({
    nature: false,
    whiteNoise: false,
    melody: false,
  });
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
  const natureHowlRef = useRef<any | null>(null);
  const whiteNoiseHowlRef = useRef<any | null>(null);
  const melodyHowlRef = useRef<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);
  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;
    if (!Howler) {
      try {
        const h = require("howler");
        Howler = h.Howler;
        Howl = h.Howl;
      } catch (e) {
        console.error("Error loading Howler:", e);
        return;
      }
    }
    const f = () => {
      try {
        if (Howler && Howler.ctx && Howler.ctx.state !== "running") {
          Howler.ctx.resume().then(() => {
            setAudioContextUnlocked(true);
          });
        } else {
          setAudioContextUnlocked(true);
        }
      } catch (e) {}
    };
    f();
    const evts = ["click", "touchstart", "keydown"];
    const u = () => {
      try {
        if (Howler && Howler.ctx && Howler.ctx.state !== "running") {
          Howler.ctx.resume().then(() => {
            setAudioContextUnlocked(true);
            evts.forEach((e) => document.removeEventListener(e, u));
          });
        } else {
          setAudioContextUnlocked(true);
          evts.forEach((e) => document.removeEventListener(e, u));
        }
      } catch (e) {}
    };
    evts.forEach((e) => {
      document.addEventListener(e, u, { once: true });
    });
    return () => {
      evts.forEach((e) => {
        document.removeEventListener(e, u);
      });
    };
  }, [isMounted]);
  const stopAllSounds = () => {
    const s = (r: React.MutableRefObject<any | null>) => {
      try {
        if (r.current) {
          r.current.stop();
          r.current.unload();
          r.current = null;
        }
      } catch (e) {
        console.error("Error stopping sound:", e);
      }
    };
    s(natureHowlRef);
    s(whiteNoiseHowlRef);
    s(melodyHowlRef);
  };
  const createHowl = (
    arrFuentes: string[],
    cat: "nature" | "whiteNoise" | "melody",
    fn: (howl: any) => void
  ) => {
    if (!isMounted || typeof window === "undefined" || !Howl) return null;
    
    let volCat = 0;
    switch(cat) {
      case "nature":
        volCat = natureVolume;
        break;
      case "whiteNoise":
        volCat = whiteNoiseVolume;
        break;
      case "melody":
        volCat = melodyVolume;
        break;
    }
    
    let volInicial = (masterVolume / 100) * (volCat / 100);
    volInicial = Math.max(0, Math.min(1, volInicial));
    
    setAudioStatus((p) => ({
      ...p,
      [cat]: { loaded: false, error: null },
    }));
    
    const h = new Howl({
      src: arrFuentes,
      html5: true,
      loop: true,
      preload: true,
      volume: volInicial,
      format: ["mp3", "wav", "ogg"],
      onload: () => {
        setAudioStatus((p) => ({
          ...p,
          [cat]: { loaded: true, error: null },
        }));
        fn(h);
      },
      onloaderror: () => {
        setAudioStatus((p) => ({
          ...p,
          [cat]: { loaded: false, error: "Failed to load audio" },
        }));
      },
      onplayerror: () => {
        try {
          if (Howler && Howler.ctx && Howler.ctx.state !== "running") {
            Howler.ctx.resume().then(() => {
              setAudioContextUnlocked(true);
              updateSoundVolume(cat, h);
              setTimeout(() => {
                h.play();
              }, 100);
            });
          } else {
            setAudioStatus((p) => ({
              ...p,
              [cat]: { ...p[cat], error: "Failed to play audio" },
            }));
          }
        } catch (e) {
          setAudioStatus((p) => ({
            ...p,
            [cat]: { ...p[cat], error: "Failed to play audio" },
          }));
        }
      },
    });
    return h;
  };
  const updateSoundVolume = (cat: "nature" | "whiteNoise" | "melody", h?: any) => {
    if (!isMounted) return;
    
    let volCat = 0;
    switch(cat) {
      case "nature":
        volCat = natureVolume;
        break;
      case "whiteNoise":
        volCat = whiteNoiseVolume;
        break;
      case "melody":
        volCat = melodyVolume;
        break;
    }
    
    let vol = (masterVolume / 100) * (volCat / 100);
    vol = Math.max(0, Math.min(1, vol));
    
    if (h && typeof h.volume === "function") {
      h.volume(vol);
      return;
    }
    
    const ref = cat === "nature" 
      ? natureHowlRef 
      : cat === "whiteNoise" 
        ? whiteNoiseHowlRef 
        : melodyHowlRef;
          
    if (ref.current && typeof ref.current.volume === "function") {
      ref.current.volume(vol);
    }
  };
  useEffect(() => {
    if (!isMounted || typeof window === "undefined" || !Howl) return;
    
    const f = (
      cat: "nature" | "whiteNoise" | "melody",
      trackId: string,
      ref: React.MutableRefObject<any | null>
    ) => {
      if (ref.current) {
        const estaba = playingStates[cat];
        ref.current.stop();
        ref.current.unload();
        ref.current = null;
        const d =
          SOUND_URLS[cat][trackId as keyof (typeof SOUND_URLS)[typeof cat]];
        if (!d) return;
        const arr: string[] = [];
        if (d.local) arr.push(d.local);
        if (d.fallback) arr.push(d.fallback);
        if (d.alternate) arr.push(d.alternate);
        const newH = createHowl(arr, cat, (x) => {
          updateSoundVolume(cat, x);
          if (estaba && audioContextUnlocked) {
            x.play();
          }
        });
        ref.current = newH;
        return;
      }
      
      const d =
        SOUND_URLS[cat][trackId as keyof (typeof SOUND_URLS)[typeof cat]];
      if (!d) return;
      const arr: string[] = [];
      if (d.local) arr.push(d.local);
      if (d.fallback) arr.push(d.fallback);
      if (d.alternate) arr.push(d.alternate);
      const newH = createHowl(arr, cat, (x) => {
        updateSoundVolume(cat, x);
      });
      ref.current = newH;
    };
    
    if (selectedTracks.nature) {
      f("nature", selectedTracks.nature, natureHowlRef);
    }
    if (selectedTracks.whiteNoise) {
      f("whiteNoise", selectedTracks.whiteNoise, whiteNoiseHowlRef);
    }
    if (selectedTracks.melody) {
      f("melody", selectedTracks.melody, melodyHowlRef);
    }
    
    return () => {
      stopAllSounds();
    };
  }, [isMounted]);
  const handleTrackChange = (
    cat: keyof typeof selectedTracks,
    trackId: string
  ) => {
    if (selectedTracks[cat] === trackId) return;
    
    const nm = SOUND_CATEGORIES[cat].find((t) => t.id === trackId)?.name;
    if (nm) {
      toast(`Switching to ${nm}`, { duration: 1500 });
    }
    
    const estaba = playingStates[cat];
    
    setSelectedTracks((p) => ({ ...p, [cat]: trackId }));
    
    const ref =
      cat === "nature"
        ? natureHowlRef
        : cat === "whiteNoise"
        ? whiteNoiseHowlRef
        : melodyHowlRef;
    
    if (ref.current) {
      ref.current.stop();
      ref.current.unload();
      ref.current = null;
    }
    
    const d =
      SOUND_URLS[cat][trackId as keyof (typeof SOUND_URLS)[typeof cat]];
    if (d) {
      const arr: string[] = [];
      if (d.local) arr.push(d.local);
      if (d.fallback) arr.push(d.fallback);
      if (d.alternate) arr.push(d.alternate);
      
      const n = createHowl(arr, cat, (x) => {
        updateSoundVolume(cat, x);
        
        if (estaba && audioContextUnlocked) {
          x.play();
        }
      });
      
      ref.current = n;
    }
    
    setAudioStatus((p) => ({
      ...p,
      [cat]: { loaded: false, error: null },
    }));
  };
  useEffect(() => {
    if (!isMounted || !audioContextUnlocked) return;
    
    if (natureHowlRef.current) {
      if (playingStates.nature) {
        updateSoundVolume("nature");
        if (!natureHowlRef.current.playing()) {
          natureHowlRef.current.play();
        }
      } else {
        natureHowlRef.current.pause();
      }
    }
    
    if (whiteNoiseHowlRef.current) {
      if (playingStates.whiteNoise) {
        updateSoundVolume("whiteNoise");
        if (!whiteNoiseHowlRef.current.playing()) {
          whiteNoiseHowlRef.current.play();
        }
      } else {
        whiteNoiseHowlRef.current.pause();
      }
    }
    
    if (melodyHowlRef.current) {
      if (playingStates.melody) {
        updateSoundVolume("melody");
        if (!melodyHowlRef.current.playing()) {
          melodyHowlRef.current.play();
        }
      } else {
        melodyHowlRef.current.pause();
      }
    }
  }, [playingStates, isMounted, audioContextUnlocked]);
  useEffect(() => {
    if (isMounted) {
      if (natureHowlRef.current) updateSoundVolume("nature");
      if (whiteNoiseHowlRef.current) updateSoundVolume("whiteNoise");
      if (melodyHowlRef.current) updateSoundVolume("melody");
    }
  }, [masterVolume, isMounted]);
  useEffect(() => {
    if (isMounted && natureHowlRef.current) {
      updateSoundVolume("nature");
    }
  }, [natureVolume, isMounted]);
  useEffect(() => {
    if (isMounted && whiteNoiseHowlRef.current) {
      updateSoundVolume("whiteNoise");
    }
  }, [whiteNoiseVolume, isMounted]);
  useEffect(() => {
    if (isMounted && melodyHowlRef.current) {
      updateSoundVolume("melody");
    }
  }, [melodyVolume, isMounted]);
  const toggleCategoryPlayback = (
    cat: "nature" | "whiteNoise" | "melody"
  ) => {
    const s = !playingStates[cat];
    
    setPlayingStates((p) => ({
      ...p,
      [cat]: s,
    }));
    
    const ref =
      cat === "nature"
        ? natureHowlRef
        : cat === "whiteNoise"
        ? whiteNoiseHowlRef
        : melodyHowlRef;
    
    if (s) {
      if (!ref.current) {
        const tr = selectedTracks[cat];
        const d = SOUND_URLS[cat][tr as keyof (typeof SOUND_URLS)[typeof cat]];
        if (d) {
          const arr: string[] = [];
          if (d.local) arr.push(d.local);
          if (d.fallback) arr.push(d.fallback);
          if (d.alternate) arr.push(d.alternate);
          
          ref.current = createHowl(arr, cat, (x) => {
            updateSoundVolume(cat, x);
            
            if (audioContextUnlocked) {
              x.play();
            }
          });
        }
      } else {
        updateSoundVolume(cat, ref.current);
        
        if (audioContextUnlocked) {
          ref.current.play();
        }
      }
    } else {
      if (ref.current) {
        ref.current.pause();
      }
    }
  };
  return (
    <Card className="shadow-lg w-full max-w-[95vw] sm:max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span>Mixer</span>
          <div className="flex gap-2"></div>
        </CardTitle>
        <CardDescription>Adjust the controls for your mix</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {masterVolume > 0 ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <Label>Master Volume</Label>
            </div>
            <span className="text-sm text-muted-foreground w-8 text-right">
              {masterVolume}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[masterVolume]}
            onValueChange={(v) => setMasterVolume(v[0])}
            className="cursor-pointer"
            aria-label="master volume"
          />
        </div>
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium text-center">
            Nature
          </h3>
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {SOUND_CATEGORIES.nature.map((track) => (
              <Button
                key={track.id}
                variant={
                  selectedTracks.nature === track.id ? "default" : "outline"
                }
                onClick={() => handleTrackChange("nature", track.id)}
                className={`w-full flex items-center justify-center text-xs md:text-sm py-1.5 md:py-2 px-1 md:px-3 h-auto ${
                  selectedTracks.nature === track.id
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                <span className="flex items-center">
                  {track.icon}
                  <span>{track.name}</span>
                </span>
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Volume</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCategoryPlayback("nature")}
                  className="h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200 bg-secondary/30 hover:bg-secondary/50"
                  aria-label={
                    playingStates.nature
                      ? "Pause nature"
                      : "Play nature"
                  }
                >
                  {playingStates.nature ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {natureVolume}%
                </span>
              </div>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[natureVolume]}
              onValueChange={(v) => setNatureVolume(v[0])}
              className="cursor-pointer"
              aria-label="Nature volume"
            />
            {audioStatus.nature.error && (
              <p className="text-xs text-destructive mt-1">
                {audioStatus.nature.error}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium text-center">
            White Noise
          </h3>
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {SOUND_CATEGORIES.whiteNoise.map((track) => (
              <Button
                key={track.id}
                variant={
                  selectedTracks.whiteNoise === track.id ? "default" : "outline"
                }
                onClick={() => handleTrackChange("whiteNoise", track.id)}
                className={`w-full flex items-center justify-center text-xs md:text-sm py-1.5 md:py-2 px-1 md:px-3 h-auto ${
                  selectedTracks.whiteNoise === track.id
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                <span className="flex items-center">
                  {track.icon}
                  <span>{track.name}</span>
                </span>
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Volume</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCategoryPlayback("whiteNoise")}
                  className="h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200 bg-secondary/30 hover:bg-secondary/50"
                  aria-label={
                    playingStates.whiteNoise
                      ? "Pause white noise"
                      : "Play white noise"
                  }
                >
                  {playingStates.whiteNoise ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {whiteNoiseVolume}%
                </span>
              </div>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[whiteNoiseVolume]}
              onValueChange={(v) => setWhiteNoiseVolume(v[0])}
              className="cursor-pointer"
              aria-label="White noise volume"
            />
            {audioStatus.whiteNoise.error && (
              <p className="text-xs text-destructive mt-1">
                {audioStatus.whiteNoise.error}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium text-center">
            Melody
          </h3>
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {SOUND_CATEGORIES.melody.map((track) => (
              <Button
                key={track.id}
                variant={selectedTracks.melody === track.id ? "default" : "outline"}
                onClick={() => handleTrackChange("melody", track.id)}
                className={`w-full flex items-center justify-center text-xs md:text-sm py-1.5 md:py-2 px-1 md:px-3 h-auto ${
                  selectedTracks.melody === track.id
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                <span className="flex items-center">
                  {track.icon}
                  <span>{track.name}</span>
                </span>
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Volume</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCategoryPlayback("melody")}
                  className="h-8 w-8 p-0 shadow-sm hover:shadow-md transition-all duration-200 bg-secondary/30 hover:bg-secondary/50"
                  aria-label={
                    playingStates.melody
                      ? "Pause melody"
                      : "Play melody"
                  }
                >
                  {playingStates.melody ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {melodyVolume}%
                </span>
              </div>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[melodyVolume]}
              onValueChange={(v) => setMelodyVolume(v[0])}
              className="cursor-pointer"
              aria-label="Melody volume"
            />
            {audioStatus.melody.error && (
              <p className="text-xs text-destructive mt-1">
                {audioStatus.melody.error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <ClientOnly>
          {!audioContextUnlocked && isMounted && (
            <div className="text-xs text-amber-500 text-center mt-2">
              <p>Tap to enable audio</p>
            </div>
          )}
        </ClientOnly>
      </CardFooter>
    </Card>
  );
}
