import { renderHook, act } from '@testing-library/react'
import { usePhotoCapture } from './use-photo-capture'

describe('usePhotoCapture', () => {
  let mockVideoRef: React.RefObject<HTMLVideoElement>
  let mockCanvasRef: React.RefObject<HTMLCanvasElement>

  beforeEach(() => {
    mockVideoRef = {
      current: {
        videoWidth: 640,
        videoHeight: 480,
      } as HTMLVideoElement,
    }

    mockCanvasRef = {
      current: document.createElement('canvas'),
    }

    jest.useFakeTimers()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => usePhotoCapture())

    expect(result.current.showFlash).toBe(false)
    expect(result.current.canvasRef.current).toBeNull()
  })

  it('should capture photo from video', async () => {
    const { result } = renderHook(() => usePhotoCapture())

    // Assign mock canvas
    Object.defineProperty(result.current.canvasRef, 'current', {
      value: mockCanvasRef.current,
      writable: true,
    })

    let capturePromise: Promise<any>

    act(() => {
      capturePromise = result.current.capture(mockVideoRef, 'left')
    })

    // Flash should be visible
    expect(result.current.showFlash).toBe(true)

    // Advance timers for flash animation (now 600ms)
    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    const capture = await capturePromise!

    expect(capture).toMatchObject({
      pose: 'left',
      dataUrl: 'data:image/png;base64,mock',
    })
    expect(capture.timestamp).toEqual(expect.any(Number))
  })

  it('should set flash to false after animation', async () => {
    const { result } = renderHook(() => usePhotoCapture())

    Object.defineProperty(result.current.canvasRef, 'current', {
      value: mockCanvasRef.current,
      writable: true,
    })

    act(() => {
      result.current.capture(mockVideoRef, 'center')
    })

    expect(result.current.showFlash).toBe(true)

    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    // Flash timer completes
    await act(async () => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current.showFlash).toBe(false)
  })

  it('should download capture correctly', () => {
    const { result } = renderHook(() => usePhotoCapture())

    const mockCapture = {
      pose: 'right' as const,
      dataUrl: 'data:image/png;base64,test',
      timestamp: Date.now(),
    }

    // Mock link click
    const createElementSpy = jest.spyOn(document, 'createElement')
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    createElementSpy.mockReturnValue(mockLink as any)

    act(() => {
      result.current.download(mockCapture)
    })

    expect(mockLink.href).toBe('data:image/png;base64,test')
    expect(mockLink.download).toMatch(/liveness-right-\d+\.jpg/)
    expect(mockLink.click).toHaveBeenCalled()

    createElementSpy.mockRestore()
  })

  it('should handle multiple captures', async () => {
    const { result } = renderHook(() => usePhotoCapture())

    Object.defineProperty(result.current.canvasRef, 'current', {
      value: mockCanvasRef.current,
      writable: true,
    })

    const poses: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right']
    const captures: any[] = []

    for (const pose of poses) {
      let promise: Promise<any>

      act(() => {
        promise = result.current.capture(mockVideoRef, pose)
      })

      await act(async () => {
        jest.advanceTimersByTime(600)
      })

      captures.push(await promise!)
    }

    expect(captures).toHaveLength(3)
    expect(captures[0].pose).toBe('left')
    expect(captures[1].pose).toBe('center')
    expect(captures[2].pose).toBe('right')
  })
})
