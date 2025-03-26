"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Initialize theme on component mount
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Set initial state based on HTML class
      const isDark = document.documentElement.classList.contains("dark")
      setIsDarkMode(isDark)
    }
  }, [])

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      // Toggle dark class on HTML element
      document.documentElement.classList.toggle("dark")
      // Update state
      setIsDarkMode(!isDarkMode)
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="h-10 w-10">
      {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

