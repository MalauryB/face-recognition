import { useRef, useEffect, useCallback } from 'react'
import { useFaceDetection } from './use-face-detection'

interface UseCameraOptions {
  isActive: boolean
  onError?: (error: Error) => void
}

export function useCamera({ isActive, onError }: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isStartingRef = useRef(false)
  const { isReady, headOrientation, startCamera, stopCamera } = useFaceDetection()

  // Start camera when active
  useEffect(() => {
    if (!isActive) {
      stopCamera()
      return
    }

    if (!videoRef.current || !isReady || isStartingRef.current) {
      return
    }

    isStartingRef.current = true

    startCamera(videoRef.current)
      .catch((error) => {
        console.error("Failed to start camera:", error)
        onError?.(error)
      })
      .finally(() => {
        isStartingRef.current = false
      })

    return () => {
      stopCamera()
    }
  }, [isActive, isReady, startCamera, stopCamera, onError])

  const stop = useCallback(() => {
    stopCamera()
  }, [stopCamera])

  return {
    videoRef,
    headOrientation,
    isReady,
    stopCamera: stop
  }
}
