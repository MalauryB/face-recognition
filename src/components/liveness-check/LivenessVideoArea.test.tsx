import { render, screen } from '@testing-library/react'

import { LivenessVideoArea } from './LivenessVideoArea'
import { createRef } from 'react'

describe('LivenessVideoArea', () => {
  const videoRef = createRef<HTMLVideoElement>()
  const canvasRef = createRef<HTMLCanvasElement>()

  const defaultState = {
    status: 'idle' as const,
    progress: 0,
    showFlash: false,
    isCompleted: false,
  }

  it('should render video and canvas elements', () => {
    const { container } = render(
      <LivenessVideoArea videoRef={videoRef} canvasRef={canvasRef} state={defaultState} />
    )

    const video = container.querySelector('video')
    const canvas = container.querySelector('canvas')

    expect(video).toBeInTheDocument()
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveClass('hidden')
  })

  it('should render idle state via renderIdle', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={defaultState}
        renderIdle={() => <div>Camera is idle</div>}
      />
    )

    expect(screen.getByText('Camera is idle')).toBeInTheDocument()
  })

  it('should not render idle state when status is active', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ ...defaultState, status: 'active' }}
        renderIdle={() => <div>Camera is idle</div>}
      />
    )

    expect(screen.queryByText('Camera is idle')).not.toBeInTheDocument()
  })

  it('should render active state via renderActive', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ ...defaultState, status: 'active' }}
        renderActive={() => <div>Face guide overlay</div>}
      />
    )

    expect(screen.getByText('Face guide overlay')).toBeInTheDocument()
  })

  it('should not render active state when status is idle', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={defaultState}
        renderActive={() => <div>Face guide overlay</div>}
      />
    )

    expect(screen.queryByText('Face guide overlay')).not.toBeInTheDocument()
  })

  it('should render overlay with state via renderOverlay', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ ...defaultState, status: 'active', progress: 50 }}
        renderOverlay={(state) => <div>Progress: {state.progress}%</div>}
      />
    )

    expect(screen.getByText('Progress: 50%')).toBeInTheDocument()
  })

  it('should render completion message via renderCompletion', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ ...defaultState, isCompleted: true }}
        renderCompletion={() => <div>All done!</div>}
      />
    )

    expect(screen.getByText('All done!')).toBeInTheDocument()
  })

  it('should not render completion when not completed', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={defaultState}
        renderCompletion={() => <div>All done!</div>}
      />
    )

    expect(screen.queryByText('All done!')).not.toBeInTheDocument()
  })

  it('should show flash effect when showFlash is true', () => {
    const { container } = render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ ...defaultState, showFlash: true }}
      />
    )

    const flash = container.querySelector('.animate-pulse.bg-white')
    expect(flash).toBeInTheDocument()
  })

  it('should not show flash effect when showFlash is false', () => {
    const { container } = render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ ...defaultState, showFlash: false }}
      />
    )

    const flash = container.querySelector('.animate-pulse.bg-white')
    expect(flash).not.toBeInTheDocument()
  })

  it('should support children render function with state', () => {
    render(
      <LivenessVideoArea videoRef={videoRef} canvasRef={canvasRef} state={defaultState}>
        {(state) => <div>Status: {state.status}</div>}
      </LivenessVideoArea>
    )

    expect(screen.getByText('Status: idle')).toBeInTheDocument()
  })

  it('should render all props simultaneously', () => {
    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ status: 'active', progress: 75, showFlash: false, isCompleted: false }}
        renderActive={() => <div>Active</div>}
        renderOverlay={(state) => <div>Progress: {state.progress}</div>}
      >
        {(state) => <div>Debug: {state.status}</div>}
      </LivenessVideoArea>
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Progress: 75')).toBeInTheDocument()
    expect(screen.getByText('Debug: active')).toBeInTheDocument()
  })

  it('should hide video when status is idle', () => {
    const { container } = render(
      <LivenessVideoArea videoRef={videoRef} canvasRef={canvasRef} state={defaultState} />
    )

    const video = container.querySelector('video')
    expect(video).toHaveClass('hidden')
  })

  it('should show video when status is active', () => {
    const { container } = render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={{ ...defaultState, status: 'active' }}
      />
    )

    const video = container.querySelector('video')
    expect(video).not.toHaveClass('hidden')
  })

  it('should apply correct video attributes', () => {
    const { container } = render(
      <LivenessVideoArea videoRef={videoRef} canvasRef={canvasRef} state={defaultState} />
    )

    const video = container.querySelector('video') as HTMLVideoElement
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('playsinline')
    expect(video.muted).toBe(true)
  })

  it('should render without any render props', () => {
    const { container } = render(
      <LivenessVideoArea videoRef={videoRef} canvasRef={canvasRef} state={defaultState} />
    )

    expect(container.querySelector('video')).toBeInTheDocument()
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })

  it('should pass correct state to all render functions', () => {
    const mockState = {
      status: 'active' as const,
      progress: 33,
      showFlash: true,
      isCompleted: false,
    }

    const renderOverlay = jest.fn((state) => <div>Overlay</div>)
    const children = jest.fn((state) => <div>Children</div>)

    render(
      <LivenessVideoArea
        videoRef={videoRef}
        canvasRef={canvasRef}
        state={mockState}
        renderOverlay={renderOverlay}
      >
        {children}
      </LivenessVideoArea>
    )

    expect(renderOverlay).toHaveBeenCalledWith(mockState)
    expect(children).toHaveBeenCalledWith(mockState)
  })
})
