"use client"
import { useState, useEffect } from "react"

export default function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (so the code works on server-side rendering)
    if (typeof window !== "undefined") {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      // Initial check
      checkIfMobile()

      // Add event listener for window resize
      window.addEventListener("resize", checkIfMobile)

      // Cleanup event listener
      return () => window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
}
