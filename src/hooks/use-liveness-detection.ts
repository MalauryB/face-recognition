import { useState, useEffect, useCallback, useRef } from 'react'
import { Capture, CaptureStatus, Pose, POSES } from '@/types/liveness'
import { HeadOrientation } from './use-face-detection'

interface UseLivenessDetectionOptions {
  headOrientation: HeadOrientation
  onCaptureRequired: (pose: Pose) => Promise<void>
  onComplete: () => void
}

const STABLE_TIME_REQUIRED = 1000 // 1 second in milliseconds

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

  const poseStartTimeRef = useRef<number | null>(null)
  const captureTriggeredRef = useRef(false)

  const currentPose = POSES[currentPoseIndex]
  const isCompleted = captures.length === POSES.length

  // Handle capture function (defined early for use in effects)
  const handleCapture = useCallback(async () => {
    setStatus('capturing')

    try {
      await onCaptureRequired(currentPose.id)

      // Move to next pose or complete
      if (currentPoseIndex < POSES.length - 1) {
        // Add a brief delay before transitioning to next pose
        await new Promise(resolve => setTimeout(resolve, 800))
        // Reset refs for next pose
        poseStartTimeRef.current = null
        captureTriggeredRef.current = false
        setCurrentPoseIndex((prev) => prev + 1)
        setStatus('active')
      }
    } catch (error) {
      console.error('Capture failed:', error)
      // Reset refs on error
      poseStartTimeRef.current = null
      captureTriggeredRef.current = false
      setStatus('active')
    }
  }, [currentPose.id, currentPoseIndex, onCaptureRequired])

  // Track head orientation changes
  useEffect(() => {
    if (status === 'active' && !isCompleted && headOrientation !== 'none') {
      const targetPose = currentPose.id

      if (headOrientation === targetPose) {
        // Start timing if not already started
        if (poseStartTimeRef.current === null) {
          poseStartTimeRef.current = Date.now()
        }
      } else {
        // Reset if pose changes
        poseStartTimeRef.current = null
        captureTriggeredRef.current = false
        setDetectionStableCount(0)
      }
    }
  }, [status, isCompleted, headOrientation, currentPose.id])

  // Check time continuously with interval
  useEffect(() => {
    if (status !== 'active' || isCompleted) {
      return
    }

    const interval = setInterval(() => {
      if (poseStartTimeRef.current !== null && !captureTriggeredRef.current) {
        const timeHeld = Date.now() - poseStartTimeRef.current

        // Update visual progress (0-30 for visual feedback)
        const visualProgress = Math.min(30, Math.floor((timeHeld / STABLE_TIME_REQUIRED) * 30))
        setDetectionStableCount(visualProgress)

        // Capture after stable time
        if (timeHeld >= STABLE_TIME_REQUIRED) {
          captureTriggeredRef.current = true
          handleCapture()
          poseStartTimeRef.current = null
          setDetectionStableCount(0)
        }
      }
    }, 50) // Check every 50ms for smooth progress updates

    return () => clearInterval(interval)
  }, [status, isCompleted, handleCapture])

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

  const start = useCallback(() => {
    setStatus('active')
    setCaptures([])
    setCurrentPoseIndex(0)
    setProgress(0)
    setDetectionStableCount(0)
    poseStartTimeRef.current = null
    captureTriggeredRef.current = false
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setCaptures([])
    setCurrentPoseIndex(0)
    setProgress(0)
    setDetectionStableCount(0)
    poseStartTimeRef.current = null
    captureTriggeredRef.current = false
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
