import { useRef, useState, useCallback } from 'react'
import { Capture, Pose } from '@/types/liveness'

export function usePhotoCapture() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showFlash, setShowFlash] = useState(false)

  const capture = useCallback(
    (videoRef: React.RefObject<HTMLVideoElement>, pose: Pose): Promise<Capture> => {
      return new Promise((resolve, reject) => {
        setShowFlash(true)

        setTimeout(() => {
          const canvas = canvasRef.current
          const video = videoRef.current

          if (!canvas || !video) {
            setShowFlash(false)
            reject(new Error('Canvas or video not available'))
            return
          }

          // Check if video has valid dimensions
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            setShowFlash(false)
            reject(new Error('Video dimensions not ready'))
            return
          }

          try {
            // Set canvas size to match video
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            if (!ctx) {
              throw new Error('Cannot get canvas context')
            }

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
            const newCapture: Capture = {
              pose,
              dataUrl,
              timestamp: Date.now(),
            }

            setShowFlash(false)
            resolve(newCapture)
          } catch (error) {
            setShowFlash(false)
            reject(error)
          }
        }, 600)
      })
    },
    []
  )

  const download = useCallback((capture: Capture) => {
    const link = document.createElement('a')
    link.href = capture.dataUrl
    link.download = `liveness-${capture.pose}-${capture.timestamp}.jpg`
    link.click()
  }, [])

  return {
    canvasRef,
    showFlash,
    capture,
    download,
  }
}
