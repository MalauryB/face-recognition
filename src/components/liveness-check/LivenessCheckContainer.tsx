import { useState, useCallback } from "react"
import { LivenessCheckPresenter } from "./LivenessCheckPresenter"
import { useCamera } from "@/hooks/use-camera"
import { usePhotoCapture } from "@/hooks/use-photo-capture"
import { useLivenessDetection } from "@/hooks/use-liveness-detection"
import { Capture, Pose, CaptureStatus } from "@/types/liveness"

export function LivenessCheckContainer() {
  const [status, setStatus] = useState<CaptureStatus>("idle")

  // Custom hooks
  const { videoRef, headOrientation, stopCamera } = useCamera({
    isActive: status === "active",
    onError: () => setStatus("idle"),
  })

  const { canvasRef, showFlash, capture, download } = usePhotoCapture()

  const handleCaptureRequired = useCallback(
    async (pose: Pose) => {
      const photo = await capture(videoRef, pose)
      addCapture(photo)
    },
    [capture, videoRef]
  )

  const {
    currentPose,
    captures,
    progress,
    isCompleted,
    start,
    reset,
    addCapture,
  } = useLivenessDetection({
    headOrientation,
    onCaptureRequired: handleCaptureRequired,
    onComplete: () => {
      setStatus("completed")
      stopCamera()
    },
  })

  // Handlers
  const handleStart = useCallback(() => {
    setStatus("active")
    start()
  }, [start])

  const handleReset = useCallback(() => {
    stopCamera()
    setStatus("idle")
    reset()
  }, [stopCamera, reset])

  const handleDownload = useCallback(
    (captureToDownload: Capture) => {
      download(captureToDownload)
    },
    [download]
  )

  return (
    <LivenessCheckPresenter
      status={status}
      currentPose={currentPose}
      captures={captures}
      progress={progress}
      showFlash={showFlash}
      isCompleted={isCompleted}
      videoRef={videoRef}
      canvasRef={canvasRef}
      onStartCapture={handleStart}
      onResetCapture={handleReset}
      onDownloadCapture={handleDownload}
    />
  )
}
