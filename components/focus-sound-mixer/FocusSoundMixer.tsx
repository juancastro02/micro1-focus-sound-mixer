"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

import useFocusSoundMixer from "@/hooks/useFocusSoundMixer";
import { SOUND_CATEGORIES, SoundCategory } from "@/lib/sound-data";

function getIconByName(icon: string) {
  switch (icon) {
    case "Droplets":
      return <Droplets className="h-4 w-4 mr-1" />;
    case "Leaf":
      return <Leaf className="h-4 w-4 mr-1" />;
    case "Waves":
      return <Waves className="h-4 w-4 mr-1" />;
    case "Cloud":
      return <Cloud className="h-4 w-4 mr-1" />;
    case "Wind":
      return <Wind className="h-4 w-4 mr-1" />;
    case "Radio":
      return <Radio className="h-4 w-4 mr-1" />;
    case "Music":
      return <Music className="h-4 w-4 mr-1" />;
    case "Piano":
      return <Piano className="h-4 w-4 mr-1" />;
    case "Headphones":
      return <Headphones className="h-4 w-4 mr-1" />;
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
  } = useFocusSoundMixer();

  const [activeTab, setActiveTab] = useState<SoundCategory>("nature");

  return (
    <Card className="shadow-lg w-full max-w-[95vw] sm:max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-foreground">Focus Sound Mixer</CardTitle>
        <CardDescription>
          Puedes encender y mezclar Nature, White Noise y Melody a la vez.
          Cambia de pestaña sin apagar los demás sonidos.
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
            aria-label="Master volume"
            className="cursor-pointer"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as SoundCategory)}
        >
          <TabsList className="grid grid-cols-3 mb-4 gap-1">
            <TabsTrigger value="nature">
              <Leaf className="mr-1 h-4 w-4" />
              Nature
            </TabsTrigger>
            <TabsTrigger value="whiteNoise">
              <Wind className="mr-1 h-4 w-4" />
              White Noise
            </TabsTrigger>
            <TabsTrigger value="melody">
              <Music className="mr-1 h-4 w-4" />
              Melody
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nature" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsNaturePlaying((prev) => !prev)}
              >
                {isNaturePlaying ? (
                  <>
                    <Pause className="mr-1 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              {SOUND_CATEGORIES.nature.map((track) => {
                const active = selectedTracks.nature === track.id;
                return (
                  <Button
                    key={track.id}
                    variant={active ? "default" : "outline"}
                    onClick={() => handleTrackChange("nature", track.id)}
                    disabled={!isNaturePlaying && !active}
                    title={
                      !isNaturePlaying && !active
                        ? "Activa Nature primero para cambiar de track"
                        : undefined
                    }
                  >
                    {getIconByName(track.icon)}
                    {track.name}
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
                aria-label="Nature volume"
                className="cursor-pointer"
              />
              {audioStatus.nature.error && (
                <p className="text-xs text-destructive mt-1">
                  {audioStatus.nature.error}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="whiteNoise" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsWhiteNoisePlaying((prev) => !prev)}
              >
                {isWhiteNoisePlaying ? (
                  <>
                    <Pause className="mr-1 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              {SOUND_CATEGORIES.whiteNoise.map((track) => {
                const active = selectedTracks.whiteNoise === track.id;
                return (
                  <Button
                    key={track.id}
                    variant={active ? "default" : "outline"}
                    onClick={() => handleTrackChange("whiteNoise", track.id)}
                    disabled={!isWhiteNoisePlaying && !active}
                    title={
                      !isWhiteNoisePlaying && !active
                        ? "Activa White Noise primero para cambiar de track"
                        : undefined
                    }
                  >
                    {getIconByName(track.icon)}
                    {track.name}
                  </Button>
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="whiteNoise-volume">Volume</Label>
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {whiteNoiseVolume}%
                </span>
              </div>
              <Slider
                id="whiteNoise-volume"
                min={0}
                max={100}
                step={1}
                value={[whiteNoiseVolume]}
                onValueChange={(v) => setWhiteNoiseVolume(v[0])}
                aria-label="White noise volume"
                className="cursor-pointer"
              />
              {audioStatus.whiteNoise.error && (
                <p className="text-xs text-destructive mt-1">
                  {audioStatus.whiteNoise.error}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="melody" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsMelodyPlaying((prev) => !prev)}
              >
                {isMelodyPlaying ? (
                  <>
                    <Pause className="mr-1 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              {SOUND_CATEGORIES.melody.map((track) => {
                const active = selectedTracks.melody === track.id;
                return (
                  <Button
                    key={track.id}
                    variant={active ? "default" : "outline"}
                    onClick={() => handleTrackChange("melody", track.id)}
                    disabled={!isMelodyPlaying && !active}
                    title={
                      !isMelodyPlaying && !active
                        ? "Activa Melody primero para cambiar de track"
                        : undefined
                    }
                  >
                    {getIconByName(track.icon)}
                    {track.name}
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
                aria-label="Melody volume"
                className="cursor-pointer"
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
        <p className="text-sm text-muted-foreground text-center">
          Si enciendes más de una categoría, todas pueden sonar a la vez, aunque
          cambies de pestaña.
        </p>
        {!audioContextUnlocked && (
          <p className="text-xs text-amber-500 text-center mt-2">
            Toca en cualquier parte para habilitar el audio
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
