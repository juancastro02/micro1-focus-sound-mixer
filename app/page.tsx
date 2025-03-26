import FocusSoundMixer from "@/components/focus-sound-mixer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">Focus Sound Mixer</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Mix nature sounds, white noise, and melodies to create your perfect focus environment
            </p>
          </div>
        </div>
        <FocusSoundMixer />
      </div>
    </main>
  )
}

