import { useState, useEffect, useCallback } from 'react'
import { Capture, CaptureStatus, Pose, POSES } from '@/types/liveness'
import { HeadOrientation } from './use-face-detection'

interface UseLivenessDetectionOptions {
  headOrientation: HeadOrientation
  onCaptureRequired: (pose: Pose) => Promise<void>
  onComplete: () => void
}

const STABLE_FRAMES_REQUIRED = 30 // ~1 second at 30fps

export function useLivenessDetection({
  headOrientation,
  onCaptureRequired,
  onComplete,
}: UseLivenessDetectionOptions) {
  const [status, setStatus] = useState<CaptureStatus>('idle')
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0)
  const [captures, setCaptures] = useState<Capture[]>([])
  const [progress, setProgress] = useState(0)
  const [detectionStableCount, setDetectionStableCount] = useState(0)

  const currentPose = POSES[currentPoseIndex]
  const isCompleted = captures.length === POSES.length

  // Detect pose and trigger capture
  useEffect(() => {
    if (status === 'active' && !isCompleted && headOrientation !== 'none') {
      const targetPose = currentPose.id

      if (headOrientation === targetPose) {
        setDetectionStableCount((prev) => prev + 1)

        // Capture after stable detection
        if (detectionStableCount >= STABLE_FRAMES_REQUIRED) {
          handleCapture()
          setDetectionStableCount(0)
        }
      } else {
        setDetectionStableCount(0)
      }
    }
  }, [status, isCompleted, headOrientation, currentPose.id, detectionStableCount])

  // Update progress
  useEffect(() => {
    setProgress((captures.length / POSES.length) * 100)
  }, [captures.length])

  // Check completion
  useEffect(() => {
    if (isCompleted && status === 'active') {
      setStatus('completed')
      onComplete()
    }
  }, [isCompleted, status, onComplete])

  const handleCapture = useCallback(async () => {
    setStatus('capturing')

    try {
      await onCaptureRequired(currentPose.id)

      // Move to next pose or complete
      if (currentPoseIndex < POSES.length - 1) {
        // Add a brief delay before transitioning to next pose
        await new Promise(resolve => setTimeout(resolve, 800))
        setCurrentPoseIndex((prev) => prev + 1)
        setStatus('active')
      }
    } catch (error) {
      console.error('Capture failed:', error)
      setStatus('active')
    }
  }, [currentPose.id, currentPoseIndex, onCaptureRequired])

  const start = useCallback(() => {
    setStatus('active')
    setCaptures([])
    setCurrentPoseIndex(0)
    setProgress(0)
    setDetectionStableCount(0)
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setCaptures([])
    setCurrentPoseIndex(0)
    setProgress(0)
    setDetectionStableCount(0)
  }, [])

  const addCapture = useCallback((capture: Capture) => {
    setCaptures((prev) => [...prev, capture])
  }, [])

  return {
    status,
    currentPose,
    currentPoseIndex,
    captures,
    progress,
    isCompleted,
    detectionStableCount,
    start,
    reset,
    addCapture,
  }
}
