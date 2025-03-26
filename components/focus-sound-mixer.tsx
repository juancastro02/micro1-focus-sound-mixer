"use client";

import { useState, useRef, useEffect } from "react";
import { Howl, Howler } from "howler";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Leaf,
  Wind,
  Music,
  Droplets,
  Cloud,
  Waves,
  Radio,
  Piano,
  Headphones,
} from "lucide-react";

const SOUND_CATEGORIES = {
  nature: [
    {
      id: "rain",
      name: "Rain",
      icon: <Droplets className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
    {
      id: "forest",
      name: "Forest",
      icon: <Leaf className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
    {
      id: "ocean",
      name: "Ocean",
      icon: <Waves className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
  ],
  whiteNoise: [
    {
      id: "white",
      name: "White",
      icon: <Cloud className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
    {
      id: "brown",
      name: "Brown",
      icon: <Wind className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
    {
      id: "pink",
      name: "Pink",
      icon: <Radio className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
  ],
  melody: [
    {
      id: "ambient",
      name: "Ambient",
      icon: <Music className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
    {
      id: "piano",
      name: "Piano",
      icon: <Piano className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
    {
      id: "lofi",
      name: "Lo-Fi",
      icon: <Headphones className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />,
    },
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

export default function FocusSoundMixer() {
  const [natureVolume, setNatureVolume] = useState(50);
  const [whiteNoiseVolume, setWhiteNoiseVolume] = useState(30);
  const [melodyVolume, setMelodyVolume] = useState(20);

  const [masterVolume, setMasterVolume] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);

  const [activeCategory, setActiveCategory] = useState<
    "nature" | "whiteNoise" | "melody"
  >("nature");

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

  useEffect(() => {
    const unlockAudioContext = () => {
      try {
        if (Howler.ctx && Howler.ctx.state !== "running") {
          Howler.ctx
            .resume()
            .then(() => {
              setAudioContextUnlocked(true);
            })
            .catch((err) => {});
        } else {
          setAudioContextUnlocked(true);
        }
      } catch (e) {}
    };

    unlockAudioContext();

    const userInteractionEvents = ["click", "touchstart", "keydown"];

    const handleUserInteraction = () => {
      try {
        if (Howler.ctx && Howler.ctx.state !== "running") {
          Howler.ctx
            .resume()
            .then(() => {
              setAudioContextUnlocked(true);

              userInteractionEvents.forEach((event) => {
                document.removeEventListener(event, handleUserInteraction);
              });
            })
            .catch((err) => {});
        } else {
          setAudioContextUnlocked(true);

          userInteractionEvents.forEach((event) => {
            document.removeEventListener(event, handleUserInteraction);
          });
        }
      } catch (e) {}
    };

    userInteractionEvents.forEach((event) => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      userInteractionEvents.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  const createHowl = (
    sources: string[],
    category: "nature" | "whiteNoise" | "melody",
    onSuccess: (howl: Howl) => void
  ) => {
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
      onloaderror: (id, error) => {
        setAudioStatus((prev) => ({
          ...prev,
          [category]: { loaded: false, error: "Failed to load audio" },
        }));
      },
      onplayerror: (id, error) => {
        try {
          if (Howler.ctx && Howler.ctx.state !== "running") {
            Howler.ctx
              .resume()
              .then(() => {
                setAudioContextUnlocked(true);
                setTimeout(() => {
                  howl.play();
                }, 100);
              })
              .catch((err) => {
                setAudioStatus((prev) => ({
                  ...prev,
                  [category]: {
                    ...prev[category],
                    error:
                      "Please interact with the page first (tap or click anywhere) to enable audio playback",
                  },
                }));
              });
          } else {
            setAudioStatus((prev) => ({
              ...prev,
              [category]: { ...prev[category], error: "Failed to play audio" },
            }));
          }
        } catch (e) {
          setAudioStatus((prev) => ({
            ...prev,
            [category]: { ...prev[category], error: "Failed to play audio" },
          }));
        }
      },
    });

    return howl;
  };

  const handleTabChange = (value: string) => {
    const newCategory = value as "nature" | "whiteNoise" | "melody";

    if (newCategory !== activeCategory) {
      setActiveCategory(newCategory);

      if (isPlaying) {
        pauseAllSounds();

        setTimeout(() => {
          if (newCategory === "nature" && natureHowlRef.current) {
            natureHowlRef.current.play();
          } else if (
            newCategory === "whiteNoise" &&
            whiteNoiseHowlRef.current
          ) {
            whiteNoiseHowlRef.current.play();
          } else if (newCategory === "melody" && melodyHowlRef.current) {
            melodyHowlRef.current.play();
          }
        }, 50);
      }
    }
  };

  useEffect(() => {
    const loadAudio = (
      category: "nature" | "whiteNoise" | "melody",
      trackId: string,
      howlRef: React.MutableRefObject<Howl | null>
    ) => {
      if (howlRef.current) {
        howlRef.current.stop();
        howlRef.current.unload();
        howlRef.current = null;
      }

      try {
        const soundData =
          SOUND_URLS[category][
            trackId as keyof (typeof SOUND_URLS)[typeof category]
          ];
        if (!soundData) {
          throw new Error(`No URL found for ${category} track: ${trackId}`);
        }

        const sources = [];

        if (soundData.local && soundData.local.trim() !== "") {
          sources.push(soundData.local);
        }
        if (soundData.fallback && soundData.fallback.trim() !== "") {
          sources.push(soundData.fallback);
        }
        if (soundData.alternate && soundData.alternate.trim() !== "") {
          sources.push(soundData.alternate);
        }

        if (sources.length === 0) {
          throw new Error(
            `No valid sources found for ${category} track: ${trackId}`
          );
        }

        howlRef.current = createHowl(sources, category, (howl) => {
          const masterVolumeMultiplier = masterVolume / 100;
          let volume = 0;

          switch (category) {
            case "nature":
              volume = Math.pow(natureVolume / 100, 2) * masterVolumeMultiplier;
              break;
            case "whiteNoise":
              volume =
                Math.pow(whiteNoiseVolume / 100, 2) * masterVolumeMultiplier;
              break;
            case "melody":
              volume = Math.pow(melodyVolume / 100, 2) * masterVolumeMultiplier;
              break;
          }

          howl.volume(Math.min(Math.max(volume, 0), 1));

          if (
            isPlaying &&
            category === activeCategory &&
            audioContextUnlocked
          ) {
            howl.play();
          }
        });
      } catch (error) {
        setAudioStatus((prev) => ({
          ...prev,
          [category]: {
            loaded: false,
            error:
              error instanceof Error ? error.message : "Failed to load audio",
          },
        }));
      }
    };

    loadAudio("nature", selectedTracks.nature, natureHowlRef);
    loadAudio("whiteNoise", selectedTracks.whiteNoise, whiteNoiseHowlRef);
    loadAudio("melody", selectedTracks.melody, melodyHowlRef);

    return () => {
      if (natureHowlRef.current) {
        natureHowlRef.current.stop();
        natureHowlRef.current.unload();
      }

      if (whiteNoiseHowlRef.current) {
        whiteNoiseHowlRef.current.stop();
        whiteNoiseHowlRef.current.unload();
      }

      if (melodyHowlRef.current) {
        melodyHowlRef.current.stop();
        melodyHowlRef.current.unload();
      }
    };
  }, [
    selectedTracks,
    masterVolume,
    natureVolume,
    whiteNoiseVolume,
    melodyVolume,
    isPlaying,
    activeCategory,
  ]);

  useEffect(() => {
    const updateVolumes = () => {
      const masterVolumeMultiplier = masterVolume / 100;

      if (natureHowlRef.current && audioStatus.nature.loaded) {
        const scaledVolume =
          Math.pow(natureVolume / 100, 2) * masterVolumeMultiplier;
        natureHowlRef.current.volume(Math.min(Math.max(scaledVolume, 0), 1));
      }

      if (whiteNoiseHowlRef.current && audioStatus.whiteNoise.loaded) {
        const scaledVolume =
          Math.pow(whiteNoiseVolume / 100, 2) * masterVolumeMultiplier;
        whiteNoiseHowlRef.current.volume(
          Math.min(Math.max(scaledVolume, 0), 1)
        );
      }

      if (melodyHowlRef.current && audioStatus.melody.loaded) {
        const scaledVolume =
          Math.pow(melodyVolume / 100, 2) * masterVolumeMultiplier;
        melodyHowlRef.current.volume(Math.min(Math.max(scaledVolume, 0), 1));
      }
    };

    updateVolumes();
  }, [natureVolume, whiteNoiseVolume, melodyVolume, masterVolume, audioStatus]);

  useEffect(() => {
    if (isPlaying) {
      playAllSounds();
    } else {
      pauseAllSounds();
    }
  }, [isPlaying]);

  const playAllSounds = () => {
    pauseAllSounds();

    if (!audioContextUnlocked && Howler.ctx && Howler.ctx.state !== "running") {
      Howler.ctx
        .resume()
        .then(() => {
          setAudioContextUnlocked(true);
          playActiveCategorySound();
        })
        .catch((err) => {
          setAudioStatus((prev) => {
            const newState = { ...prev };
            newState[activeCategory] = {
              ...prev[activeCategory],
              error:
                "Please interact with the page first to enable audio playback",
            };
            return newState;
          });
        });
    } else {
      playActiveCategorySound();
    }
  };

  const playActiveCategorySound = () => {
    if (
      activeCategory === "nature" &&
      natureHowlRef.current &&
      audioStatus.nature.loaded
    ) {
      try {
        natureHowlRef.current.play();
      } catch (error) {
        setAudioStatus((prev) => ({
          ...prev,
          nature: { ...prev.nature, error: "Failed to play audio" },
        }));
      }
    } else if (
      activeCategory === "whiteNoise" &&
      whiteNoiseHowlRef.current &&
      audioStatus.whiteNoise.loaded
    ) {
      try {
        whiteNoiseHowlRef.current.play();
      } catch (error) {
        setAudioStatus((prev) => ({
          ...prev,
          whiteNoise: { ...prev.whiteNoise, error: "Failed to play audio" },
        }));
      }
    } else if (
      activeCategory === "melody" &&
      melodyHowlRef.current &&
      audioStatus.melody.loaded
    ) {
      try {
        melodyHowlRef.current.play();
      } catch (error) {
        setAudioStatus((prev) => ({
          ...prev,
          melody: { ...prev.melody, error: "Failed to play audio" },
        }));
      }
    }
  };

  const pauseAllSounds = () => {
    if (natureHowlRef.current) {
      natureHowlRef.current.pause();
    }

    if (whiteNoiseHowlRef.current) {
      whiteNoiseHowlRef.current.pause();
    }

    if (melodyHowlRef.current) {
      melodyHowlRef.current.pause();
    }
  };

  const togglePlayback = () => {
    if (!isPlaying) {
      const anyLoaded =
        audioStatus.nature.loaded ||
        audioStatus.whiteNoise.loaded ||
        audioStatus.melody.loaded;
    }

    setIsPlaying(!isPlaying);
  };

  const handleTrackChange = (
    category: keyof typeof selectedTracks,
    trackId: string
  ) => {
    if (selectedTracks[category] === trackId) {
      if (category !== activeCategory) {
        setActiveCategory(category);

        if (isPlaying) {
          pauseAllSounds();

          setTimeout(() => {
            playAllSounds();
          }, 50);
        }
      }
      return;
    }

    setActiveCategory(category);

    pauseAllSounds();

    setSelectedTracks((prev) => ({
      ...prev,
      [category]: trackId,
    }));

    setAudioStatus((prev) => ({
      ...prev,
      [category]: { loaded: false, error: null },
    }));

    let howlRef: React.MutableRefObject<Howl | null> | null = null;
    switch (category) {
      case "nature":
        howlRef = natureHowlRef;
        break;
      case "whiteNoise":
        howlRef = whiteNoiseHowlRef;
        break;
      case "melody":
        howlRef = melodyHowlRef;
        break;
    }

    if (howlRef?.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      howlRef.current = null;
    }
  };

  return (
    <Card className="shadow-lg w-full max-w-[95vw] sm:max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span>Sound Mixer</span>
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlayback}
            className="h-10 w-10"
            aria-label={isPlaying ? "Pause sound" : "Play sound"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          Adjust the sliders to mix your perfect focus sound environment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {masterVolume > 0 ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <Label htmlFor="master-volume">Master Volume</Label>
            </div>
            <span className="text-sm text-muted-foreground w-8 text-right">
              {masterVolume}%
            </span>
          </div>
          <Slider
            id="master-volume"
            min={0}
            max={100}
            step={1}
            value={[masterVolume]}
            onValueChange={(value) => setMasterVolume(value[0])}
            className="cursor-pointer"
            aria-label="Master volume"
          />
        </div>

        <Tabs
          defaultValue="nature"
          value={activeCategory}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4 gap-1">
            <TabsTrigger
              value="nature"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-1 py-1.5"
            >
              <Leaf className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
              <span>Nature</span>
            </TabsTrigger>
            <TabsTrigger
              value="whiteNoise"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-1 py-1.5"
            >
              <Wind className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
              <span>White Noise</span>
            </TabsTrigger>
            <TabsTrigger
              value="melody"
              className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-1 py-1.5"
            >
              <Music className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
              <span>Melody</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nature" className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="nature-volume">Volume</Label>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {natureVolume}%
                </span>
              </div>
              <Slider
                id="nature-volume"
                min={0}
                max={100}
                step={1}
                value={[natureVolume]}
                onValueChange={(value) => setNatureVolume(value[0])}
                className="cursor-pointer"
                aria-label="Nature volume"
              />
              {audioStatus.nature.error && (
                <p className="text-xs text-destructive mt-1">
                  {audioStatus.nature.error}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="whiteNoise" className="space-y-4">
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {SOUND_CATEGORIES.whiteNoise.map((track) => (
                <Button
                  key={track.id}
                  variant={
                    selectedTracks.whiteNoise === track.id
                      ? "default"
                      : "outline"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="whitenoise-volume">Volume</Label>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {whiteNoiseVolume}%
                </span>
              </div>
              <Slider
                id="whitenoise-volume"
                min={0}
                max={100}
                step={1}
                value={[whiteNoiseVolume]}
                onValueChange={(value) => setWhiteNoiseVolume(value[0])}
                className="cursor-pointer"
                aria-label="White noise volume"
              />
              {audioStatus.whiteNoise.error && (
                <p className="text-xs text-destructive mt-1">
                  {audioStatus.whiteNoise.error}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="melody" className="space-y-4">
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {SOUND_CATEGORIES.melody.map((track) => (
                <Button
                  key={track.id}
                  variant={
                    selectedTracks.melody === track.id ? "default" : "outline"
                  }
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
              <div className="flex items-center justify-between">
                <Label htmlFor="melody-volume">Volume</Label>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {melodyVolume}%
                </span>
              </div>
              <Slider
                id="melody-volume"
                min={0}
                max={100}
                step={1}
                value={[melodyVolume]}
                onValueChange={(value) => setMelodyVolume(value[0])}
                className="cursor-pointer"
                aria-label="Melody volume"
              />
              {audioStatus.melody.error && (
                <p className="text-xs text-destructive mt-1">
                  {audioStatus.melody.error}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Adjust sliders to create your perfect sound mix
        </p>
        {isPlaying && (
          <div className="text-xs text-primary text-center">
            <p>Now Playing:</p>
            {activeCategory === "nature" && (
              <p className="flex items-center justify-center">
                {
                  SOUND_CATEGORIES.nature.find(
                    (t) => t.id === selectedTracks.nature
                  )?.icon
                }
                {
                  SOUND_CATEGORIES.nature.find(
                    (t) => t.id === selectedTracks.nature
                  )?.name
                }
              </p>
            )}
            {activeCategory === "whiteNoise" && (
              <p className="flex items-center justify-center">
                {
                  SOUND_CATEGORIES.whiteNoise.find(
                    (t) => t.id === selectedTracks.whiteNoise
                  )?.icon
                }
                {
                  SOUND_CATEGORIES.whiteNoise.find(
                    (t) => t.id === selectedTracks.whiteNoise
                  )?.name
                }
              </p>
            )}
            {activeCategory === "melody" && (
              <p className="flex items-center justify-center">
                {
                  SOUND_CATEGORIES.melody.find(
                    (t) => t.id === selectedTracks.melody
                  )?.icon
                }
                {
                  SOUND_CATEGORIES.melody.find(
                    (t) => t.id === selectedTracks.melody
                  )?.name
                }
              </p>
            )}
          </div>
        )}

        {!audioContextUnlocked && (
          <div className="text-xs text-amber-500 text-center mt-2">
            <p>Tap anywhere on the page to enable audio playback</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
