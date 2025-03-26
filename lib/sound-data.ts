export type SoundCategory = "nature" | "whiteNoise" | "melody";

export interface SoundSource {
  local: string;
  fallback?: string;
  alternate?: string;
}

export interface CategorySounds {
  [key: string]: SoundSource;
}

export const SOUND_CATEGORIES = {
  nature: [
    { id: "rain", name: "Rain", icon: "Droplets" },
    { id: "forest", name: "Forest", icon: "Leaf" },
    { id: "ocean", name: "Ocean", icon: "Waves" },
  ],
  whiteNoise: [
    { id: "white", name: "White", icon: "Cloud" },
    { id: "brown", name: "Brown", icon: "Wind" },
    { id: "pink", name: "Pink", icon: "Radio" },
  ],
  melody: [
    { id: "ambient", name: "Ambient", icon: "Music" },
    { id: "piano", name: "Piano", icon: "Piano" },
    { id: "lofi", name: "Lo-Fi", icon: "Headphones" },
  ],
};

export const SOUND_URLS: Record<SoundCategory, CategorySounds> = {
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
