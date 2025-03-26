"use client";

import { Volume2, VolumeX, Play, Pause, Leaf, Wind, Music, 
  Droplets, Cloud, Waves, Radio, Piano, Headphones } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, 
  CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import useFocusSoundMixer from "@/hooks/useFocusSoundMixer";
import { SOUND_CATEGORIES, SoundCategory } from "@/lib/sound-data";

function getIconByName(name: string) {
  switch (name) {
    case "Droplets":
      return <Droplets className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Leaf":
      return <Leaf className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Waves":
      return <Waves className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Cloud":
      return <Cloud className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Wind":
      return <Wind className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Radio":
      return <Radio className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Music":
      return <Music className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Piano":
      return <Piano className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    case "Headphones":
      return <Headphones className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />;
    default:
      return null;
  }
}

export default function FocusSoundMixer() {
  const {
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
  } = useFocusSoundMixer();

  return (
    <Card className="shadow-lg w-full max-w-[95vw] sm:max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <span>Sound Mixer</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlayback}
              className="h-10 w-10"
              aria-label={isPlaying ? "Pause sound" : "Play sound"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </div>
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
            onValueChange={(v) => setMasterVolume(v[0])}
            className="cursor-pointer"
            aria-label="Master volume"
          />
        </div>

        <Tabs
          defaultValue="nature"
          value={activeCategory}
          onValueChange={(val) => handleTabChange(val as SoundCategory)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4 gap-1">
            <TabsTrigger
              value="nature"
              className="flex items-center justify-center text-xs md:text-sm px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Leaf className="h-4 w-4 mr-1" />
              Nature
            </TabsTrigger>
            <TabsTrigger
              value="whiteNoise"
              className="flex items-center justify-center text-xs md:text-sm px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wind className="h-4 w-4 mr-1" />
              White Noise
            </TabsTrigger>
            <TabsTrigger
              value="melody"
              className="flex items-center justify-center text-xs md:text-sm px-1 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Music className="h-4 w-4 mr-1" />
              Melody
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nature" className="space-y-4">
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {SOUND_CATEGORIES.nature.map((track) => {
                const IconComp = getIconByName(track.icon);
                const isSelected = selectedTracks.nature === track.id;
                return (
                  <Button
                    key={track.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTrackChange("nature", track.id)}
                    className={`w-full flex items-center justify-center text-xs md:text-sm py-1.5 md:py-2 px-1 md:px-3 h-auto`}
                  >
                    <span className="flex items-center">
                      {IconComp}
                      <span>{track.name}</span>
                    </span>
                  </Button>
                );
              })}
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
          </TabsContent>

          <TabsContent value="whiteNoise" className="space-y-4">
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {SOUND_CATEGORIES.whiteNoise.map((track) => {
                const IconComp = getIconByName(track.icon);
                const isSelected = selectedTracks.whiteNoise === track.id;
                return (
                  <Button
                    key={track.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTrackChange("whiteNoise", track.id)}
                    className={`w-full flex items-center justify-center text-xs md:text-sm py-1.5 md:py-2 px-1 md:px-3 h-auto`}
                  >
                    <span className="flex items-center">
                      {IconComp}
                      <span>{track.name}</span>
                    </span>
                  </Button>
                );
              })}
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
          </TabsContent>

          <TabsContent value="melody" className="space-y-4">
            <div className="grid grid-cols-3 gap-1 md:gap-2">
              {SOUND_CATEGORIES.melody.map((track) => {
                const IconComp = getIconByName(track.icon);
                const isSelected = selectedTracks.melody === track.id;
                return (
                  <Button
                    key={track.id}
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => handleTrackChange("melody", track.id)}
                    className={`w-full flex items-center justify-center text-xs md:text-sm py-1.5 md:py-2 px-1 md:px-3 h-auto`}
                  >
                    <span className="flex items-center">
                      {IconComp}
                      <span>{track.name}</span>
                    </span>
                  </Button>
                );
              })}
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
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Adjust sliders to create your perfect sound mix
        </p>

        {!audioContextUnlocked && (
          <div className="text-xs text-amber-500 text-center mt-2">
            <p>Tap anywhere on the page to enable audio playback</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
