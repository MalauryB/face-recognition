import { renderHook, act, waitFor } from '@testing-library/react'
import { useLivenessDetection } from './use-liveness-detection'
import { HeadOrientation } from './use-face-detection'
import { Pose } from '@/types/liveness'

describe('useLivenessDetection', () => {
  const mockOnCaptureRequired = jest.fn(() => Promise.resolve())
  const mockOnComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useLivenessDetection({
        headOrientation: 'none',
        onCaptureRequired: mockOnCaptureRequired,
        onComplete: mockOnComplete,
      })
    )

    expect(result.current.status).toBe('idle')
    expect(result.current.captures).toEqual([])
    expect(result.current.progress).toBe(0)
    expect(result.current.isCompleted).toBe(false)
    expect(result.current.currentPose.id).toBe('left') // First pose
  })

  it('should start detection when start() is called', () => {
    const { result } = renderHook(() =>
      useLivenessDetection({
        headOrientation: 'none',
        onCaptureRequired: mockOnCaptureRequired,
        onComplete: mockOnComplete,
      })
    )

    act(() => {
      result.current.start()
    })

    expect(result.current.status).toBe('active')
  })

  it('should trigger capture after stable detection (30 frames)', async () => {
    const { result, rerender } = renderHook(
      ({ orientation }: { orientation: HeadOrientation }) =>
        useLivenessDetection({
          headOrientation: orientation,
          onCaptureRequired: mockOnCaptureRequired,
          onComplete: mockOnComplete,
        }),
      { initialProps: { orientation: 'none' as HeadOrientation } }
    )

    // Start detection
    act(() => {
      result.current.start()
    })

    // Simulate head turning to left (30 frames)
    for (let i = 0; i < 30; i++) {
      rerender({ orientation: 'left' })
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    }

    // Should trigger capture after 30 stable frames
    await waitFor(() => {
      expect(mockOnCaptureRequired).toHaveBeenCalledWith('left')
    })
  })

  it('should reset stable count when orientation changes', async () => {
    const { result, rerender } = renderHook(
      ({ orientation }: { orientation: HeadOrientation }) =>
        useLivenessDetection({
          headOrientation: orientation,
          onCaptureRequired: mockOnCaptureRequired,
          onComplete: mockOnComplete,
        }),
      { initialProps: { orientation: 'none' as HeadOrientation } }
    )

    act(() => {
      result.current.start()
    })

    // Initially count is 0
    expect(result.current.detectionStableCount).toBe(0)

    // Change to wrong orientation (should keep count at 0)
    await act(async () => {
      rerender({ orientation: 'right' })
    })

    // Count should still be 0 (wrong pose for 'left')
    expect(result.current.detectionStableCount).toBe(0)

    // No capture should have been triggered
    expect(mockOnCaptureRequired).not.toHaveBeenCalled()
  })

  it('should progress through all poses', async () => {
    const { result } = renderHook(() =>
      useLivenessDetection({
        headOrientation: 'none',
        onCaptureRequired: mockOnCaptureRequired,
        onComplete: mockOnComplete,
      })
    )

    act(() => {
      result.current.start()
    })

    expect(result.current.currentPose.id).toBe('left')

    // Add first capture
    await act(async () => {
      await result.current.addCapture({
        pose: 'left',
        dataUrl: 'data:image/png;base64,left',
        timestamp: Date.now(),
      })
    })

    // addCapture only updates captures array, doesn't advance pose
    expect(result.current.currentPose.id).toBe('left')
    expect(result.current.progress).toBe(33.33333333333333)

    // Add second capture
    await act(async () => {
      await result.current.addCapture({
        pose: 'center',
        dataUrl: 'data:image/png;base64,center',
        timestamp: Date.now(),
      })
    })

    // Still on 'left' pose, only captures array grows
    expect(result.current.currentPose.id).toBe('left')
    expect(result.current.progress).toBe(66.66666666666666)

    // Add third capture
    await act(async () => {
      await result.current.addCapture({
        pose: 'right',
        dataUrl: 'data:image/png;base64,right',
        timestamp: Date.now(),
      })
    })

    expect(result.current.progress).toBe(100)
    expect(result.current.isCompleted).toBe(true)

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('should reset detection state', () => {
    const { result } = renderHook(() =>
      useLivenessDetection({
        headOrientation: 'none',
        onCaptureRequired: mockOnCaptureRequired,
        onComplete: mockOnComplete,
      })
    )

    act(() => {
      result.current.start()
      result.current.addCapture({
        pose: 'left',
        dataUrl: 'data:image/png;base64,left',
        timestamp: Date.now(),
      })
    })

    expect(result.current.captures).toHaveLength(1)

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.captures).toEqual([])
    expect(result.current.progress).toBe(0)
    expect(result.current.isCompleted).toBe(false)
    expect(result.current.currentPose.id).toBe('left')
  })

  it('should update progress correctly', () => {
    const { result } = renderHook(() =>
      useLivenessDetection({
        headOrientation: 'none',
        onCaptureRequired: mockOnCaptureRequired,
        onComplete: mockOnComplete,
      })
    )

    expect(result.current.progress).toBe(0)

    act(() => {
      result.current.addCapture({
        pose: 'left',
        dataUrl: 'data:image/png;base64,1',
        timestamp: Date.now(),
      })
    })

    expect(result.current.progress).toBeCloseTo(33.33, 1)

    act(() => {
      result.current.addCapture({
        pose: 'center',
        dataUrl: 'data:image/png;base64,2',
        timestamp: Date.now(),
      })
    })

    expect(result.current.progress).toBeCloseTo(66.66, 1)

    act(() => {
      result.current.addCapture({
        pose: 'right',
        dataUrl: 'data:image/png;base64,3',
        timestamp: Date.now(),
      })
    })

    expect(result.current.progress).toBe(100)
  })

  it('should not detect when status is idle', async () => {
    const { result, rerender } = renderHook(
      ({ orientation }: { orientation: HeadOrientation }) =>
        useLivenessDetection({
          headOrientation: orientation,
          onCaptureRequired: mockOnCaptureRequired,
          onComplete: mockOnComplete,
        }),
      { initialProps: { orientation: 'left' as HeadOrientation } }
    )

    // Status is idle, simulate 30 frames
    for (let i = 0; i < 35; i++) {
      rerender({ orientation: 'left' })
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    }

    // Should NOT trigger capture because status is idle
    expect(mockOnCaptureRequired).not.toHaveBeenCalled()
  })

  it('should not detect when completed', async () => {
    const { result, rerender } = renderHook(
      ({ orientation }: { orientation: HeadOrientation }) =>
        useLivenessDetection({
          headOrientation: orientation,
          onCaptureRequired: mockOnCaptureRequired,
          onComplete: mockOnComplete,
        }),
      { initialProps: { orientation: 'none' as HeadOrientation } }
    )

    act(() => {
      result.current.start()
    })

    // Complete all captures
    act(() => {
      result.current.addCapture({ pose: 'left', dataUrl: 'data:', timestamp: 1 })
      result.current.addCapture({ pose: 'center', dataUrl: 'data:', timestamp: 2 })
      result.current.addCapture({ pose: 'right', dataUrl: 'data:', timestamp: 3 })
    })

    expect(result.current.isCompleted).toBe(true)

    // Try to detect again
    for (let i = 0; i < 35; i++) {
      rerender({ orientation: 'left' })
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
    }

    // Should only be called during the normal flow, not after completion
    expect(mockOnCaptureRequired).not.toHaveBeenCalled()
  })
})
