import { useRef, useEffect, useCallback } from 'react'
import { useFaceDetection } from './use-face-detection'

interface UseCameraOptions {
  isActive: boolean
  onError?: (error: Error) => void
}

export function useCamera({ isActive, onError }: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { isReady, headOrientation, startCamera, stopCamera } = useFaceDetection()

  // Start camera when active
  useEffect(() => {
    if (isActive && videoRef.current && isReady) {
      startCamera(videoRef.current).catch((error) => {
        console.error("Failed to start camera:", error)
        onError?.(error)
      })
    }

    return () => {
      if (!isActive) {
        stopCamera()
      }
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
