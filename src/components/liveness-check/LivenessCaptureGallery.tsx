import { Capture, PoseConfig } from "@/types/liveness"

interface CaptureItemData {
  capture: Capture
  poseInfo: PoseConfig | undefined
  index: number
}

interface LivenessCaptureGalleryProps {
  captures: Capture[]
  poses: PoseConfig[]
  onDownload?: (capture: Capture) => void
  // Render Props
  renderCapture?: (data: CaptureItemData, onDownload: (capture: Capture) => void) => React.ReactNode
  renderHeader?: (count: number) => React.ReactNode
  renderEmpty?: () => React.ReactNode
  children?: (captures: CaptureItemData[], onDownload: (capture: Capture) => void) => React.ReactNode
}

export function LivenessCaptureGallery({
  captures,
  poses,
  onDownload = () => {},
  renderCapture,
  renderHeader,
  renderEmpty,
  children,
}: LivenessCaptureGalleryProps) {
  if (captures.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>
  }

  if (captures.length === 0) {
    return null
  }

  const captureItems: CaptureItemData[] = captures.map((capture, index) => ({
    capture,
    poseInfo: poses.find((p) => p.id === capture.pose),
    index,
  }))

  return (
    <div className="rounded-2xl md:rounded-3xl border border-border bg-card p-3 md:p-4 mb-4 md:mb-0">
      {/* Custom header - Render Prop */}
      {renderHeader ? (
        renderHeader(captures.length)
      ) : (
        <h3 className="mb-2 md:mb-3 text-base md:text-lg font-semibold text-foreground">
          Photos capturées ({captures.length})
        </h3>
      )}

      <div className="space-y-2">
        {/* Children as render prop with all captures */}
        {children ? (
          children(captureItems, onDownload)
        ) : (
          // Default rendering with renderCapture or fallback
          captureItems.map((itemData) =>
            renderCapture ? (
              <div key={itemData.capture.timestamp}>
                {renderCapture(itemData, onDownload)}
              </div>
            ) : (
              <div key={itemData.capture.timestamp} className="text-sm">
                {itemData.poseInfo?.label || 'Photo'}
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}
