import { useRef, useEffect, useCallback } from 'react'
import { useFaceDetection } from './use-face-detection'

interface UseCameraOptions {
  isActive: boolean
  onError?: (error: Error) => void
}

export function useCamera({ isActive, onError }: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasStartedRef = useRef(false)
  const { isReady, headOrientation, startCamera, stopCamera } = useFaceDetection()

  // Start/stop camera when active changes
  useEffect(() => {
    if (isActive && videoRef.current && isReady && !hasStartedRef.current) {
      hasStartedRef.current = true
      startCamera(videoRef.current).catch((error) => {
        console.error("Failed to start camera:", error)
        onError?.(error)
        hasStartedRef.current = false
      })
    } else if (!isActive && hasStartedRef.current) {
      stopCamera()
      hasStartedRef.current = false
    }

    return () => {
      if (hasStartedRef.current) {
        stopCamera()
        hasStartedRef.current = false
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isReady])

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
