import { useEffect, useRef, useState, useCallback } from 'react'
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision'

export type HeadOrientation = 'left' | 'center' | 'right' | 'none'

export function useFaceDetection() {
  const [isReady, setIsReady] = useState(false)
  const [headOrientation, setHeadOrientation] = useState<HeadOrientation>('none')
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const animationFrameRef = useRef<number>()

  // Initialize Face Landmarker
  useEffect(() => {
    let isMounted = true

    async function initializeFaceLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm'
        )

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 1
        })

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker
          setIsReady(true)
        }
      } catch (error) {
        console.error('Failed to initialize Face Landmarker:', error)
      }
    }

    initializeFaceLandmarker()

    return () => {
      isMounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      faceLandmarkerRef.current?.close()
    }
  }, [])

  // Calculate head orientation from landmarks
  const calculateHeadOrientation = useCallback((result: FaceLandmarkerResult): HeadOrientation => {
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      return 'none'
    }

    const landmarks = result.faceLandmarks[0]

    // Key landmarks indices:
    // 33: left eye outer corner
    // 133: right eye outer corner
    // 263: right eye inner corner
    // 362: left eye inner corner
    // 1: nose tip
    // 199: nose bridge

    const leftEyeOuter = landmarks[33]
    const rightEyeOuter = landmarks[263]
    const noseTip = landmarks[1]
    const leftCheek = landmarks[234]
    const rightCheek = landmarks[454]

    // Calculate the horizontal position of nose relative to eyes
    const eyeCenter = (leftEyeOuter.x + rightEyeOuter.x) / 2
    const noseOffset = noseTip.x - eyeCenter

    // Calculate face width using cheeks
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x)

    // Normalize the offset
    const normalizedOffset = noseOffset / faceWidth

    // Thresholds for head orientation
    const LEFT_THRESHOLD = -0.15
    const RIGHT_THRESHOLD = 0.15

    if (normalizedOffset < LEFT_THRESHOLD) {
      return 'left'
    } else if (normalizedOffset > RIGHT_THRESHOLD) {
      return 'right'
    } else {
      return 'center'
    }
  }, [])

  // Start camera and detection
  const startCamera = useCallback(async (video: HTMLVideoElement) => {
    try {
      // Stop existing stream if any
      if (video.srcObject) {
        const existingStream = video.srcObject as MediaStream
        existingStream.getTracks().forEach(track => track.stop())
        video.srcObject = null
      }

      // Cancel any pending animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      video.srcObject = stream
      videoRef.current = video

      // Wait for video to be ready before playing
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve()
      })

      await video.play()

      // Start detection loop
      const detectFace = async () => {
        if (!faceLandmarkerRef.current || !videoRef.current) {
          return
        }

        // Check if video has valid dimensions before processing
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          animationFrameRef.current = requestAnimationFrame(detectFace)
          return
        }

        try {
          const result = faceLandmarkerRef.current.detectForVideo(
            videoRef.current,
            performance.now()
          )

          const orientation = calculateHeadOrientation(result)
          setHeadOrientation(orientation)
        } catch (error) {
          console.error('Detection error:', error)
        }

        animationFrameRef.current = requestAnimationFrame(detectFace)
      }

      detectFace()
    } catch (error) {
      console.error('Failed to start camera:', error)
      throw error
    }
  }, [calculateHeadOrientation])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    setHeadOrientation('none')
  }, [])

  return {
    isReady,
    headOrientation,
    startCamera,
    stopCamera
  }
}
