import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LivenessCaptureGallery } from './LivenessCaptureGallery'
import { POSES } from '@/types/liveness'
import type { Capture } from '@/types/liveness'

describe('LivenessCaptureGallery', () => {
  const mockCaptures: Capture[] = [
    { pose: 'left', dataUrl: 'data:image/png;base64,left', timestamp: 1 },
    { pose: 'center', dataUrl: 'data:image/png;base64,center', timestamp: 2 },
  ]

  const mockOnDownload = jest.fn()

  it('should render default header with count', () => {
    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
      />
    )

    expect(screen.getByText('Photos capturées (2)')).toBeInTheDocument()
  })

  it('should render custom header via renderHeader', () => {
    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
        renderHeader={(count) => <h3>Custom Gallery: {count} items</h3>}
      />
    )

    expect(screen.getByText('Custom Gallery: 2 items')).toBeInTheDocument()
    expect(screen.queryByText('Photos capturées (2)')).not.toBeInTheDocument()
  })

  it('should render empty state when no captures', () => {
    render(
      <LivenessCaptureGallery
        captures={[]}
        poses={POSES}
        onDownload={mockOnDownload}
        renderEmpty={() => <div>No captures yet</div>}
      />
    )

    expect(screen.getByText('No captures yet')).toBeInTheDocument()
  })

  it('should not render empty state when captures exist', () => {
    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
        renderEmpty={() => <div>No captures yet</div>}
      />
    )

    expect(screen.queryByText('No captures yet')).not.toBeInTheDocument()
  })

  it('should call renderCapture for each capture', () => {
    const renderCapture = jest.fn((itemData) => (
      <div key={itemData.index} data-testid={`capture-${itemData.capture.pose}`}>
        {itemData.poseInfo?.label}
      </div>
    ))

    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
        renderCapture={renderCapture}
      />
    )

    expect(renderCapture).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('capture-left')).toBeInTheDocument()
    expect(screen.getByTestId('capture-center')).toBeInTheDocument()
  })

  it('should provide enriched capture data with poseInfo', () => {
    const renderCapture = jest.fn((itemData) => (
      <div key={itemData.index}>
        Pose: {itemData.poseInfo?.label || 'Unknown'}
      </div>
    ))

    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
        renderCapture={renderCapture}
      />
    )

    expect(renderCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        capture: mockCaptures[0],
        poseInfo: POSES[0], // Left pose
        index: 0,
      }),
      mockOnDownload
    )

    expect(screen.getByText('Pose: Gauche')).toBeInTheDocument()
    expect(screen.getByText('Pose: Centre')).toBeInTheDocument()
  })

  it('should pass onDownload callback to renderCapture', async () => {
    const user = userEvent.setup()

    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
        renderCapture={(itemData, onDownload) => (
          <button
            key={itemData.index}
            onClick={() => onDownload(itemData.capture)}
            data-testid={`download-${itemData.capture.pose}`}
          >
            Download
          </button>
        )}
      />
    )

    const downloadBtn = screen.getByTestId('download-left')
    await user.click(downloadBtn)

    expect(mockOnDownload).toHaveBeenCalledWith(mockCaptures[0])
  })

  it('should support children render function', () => {
    render(
      <LivenessCaptureGallery captures={mockCaptures} poses={POSES} onDownload={mockOnDownload}>
        {(captureItems, onDownload) => (
          <div>
            {captureItems.map((item) => (
              <div key={item.index} data-testid={`custom-${item.capture.pose}`}>
                Custom: {item.poseInfo?.label}
              </div>
            ))}
          </div>
        )}
      </LivenessCaptureGallery>
    )

    expect(screen.getByTestId('custom-left')).toHaveTextContent('Custom: Gauche')
    expect(screen.getByTestId('custom-center')).toHaveTextContent('Custom: Centre')
  })

  it('should prefer children over renderCapture', () => {
    const renderCapture = jest.fn(() => <div>From renderCapture</div>)

    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
        renderCapture={renderCapture}
      >
        {() => <div>From children</div>}
      </LivenessCaptureGallery>
    )

    expect(screen.getByText('From children')).toBeInTheDocument()
    expect(screen.queryByText('From renderCapture')).not.toBeInTheDocument()
    expect(renderCapture).not.toHaveBeenCalled()
  })

  it('should render default captures when no render props provided', () => {
    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
      />
    )

    expect(screen.getByText('Gauche')).toBeInTheDocument()
    expect(screen.getByText('Centre')).toBeInTheDocument()
  })

  it('should handle captures with unknown poses gracefully', () => {
    const capturesWithUnknown: Capture[] = [
      { pose: 'left', dataUrl: 'data:1', timestamp: 1 },
      { pose: 'invalid' as any, dataUrl: 'data:2', timestamp: 2 },
    ]

    const renderCapture = jest.fn((itemData) => (
      <div key={itemData.index}>
        Pose: {itemData.poseInfo?.label || 'Unknown'}
      </div>
    ))

    render(
      <LivenessCaptureGallery
        captures={capturesWithUnknown}
        poses={POSES}
        onDownload={mockOnDownload}
        renderCapture={renderCapture}
      />
    )

    expect(screen.getByText('Pose: Gauche')).toBeInTheDocument()
    expect(screen.getByText('Pose: Unknown')).toBeInTheDocument()
  })

  it('should maintain correct index for each capture', () => {
    const renderCapture = jest.fn((itemData) => (
      <div key={itemData.index}>Index: {itemData.index}</div>
    ))

    render(
      <LivenessCaptureGallery
        captures={mockCaptures}
        poses={POSES}
        onDownload={mockOnDownload}
        renderCapture={renderCapture}
      />
    )

    expect(screen.getByText('Index: 0')).toBeInTheDocument()
    expect(screen.getByText('Index: 1')).toBeInTheDocument()
  })
})
