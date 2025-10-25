import { CaptureStatus } from "@/types/liveness"

interface VideoState {
  status: CaptureStatus
  progress: number
  showFlash: boolean
  isCompleted: boolean
}

interface LivenessVideoAreaProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  state: VideoState
  // Render Props
  renderIdle?: () => React.ReactNode
  renderActive?: () => React.ReactNode
  renderOverlay?: (state: VideoState) => React.ReactNode
  renderCompletion?: () => React.ReactNode
  children?: (state: VideoState) => React.ReactNode
}

export function LivenessVideoArea({
  videoRef,
  canvasRef,
  state,
  renderIdle,
  renderActive,
  renderOverlay,
  renderCompletion,
  children,
}: LivenessVideoAreaProps) {
  return (
    <div className="relative md:aspect-[4/3] bg-muted h-full max-h-full">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover ${
          state.status === "idle" ? "hidden" : ""
        }`}
      />

      {/* Idle state - Render Prop */}
      {state.status === "idle" && renderIdle && renderIdle()}

      {/* Active state - Render Prop */}
      {state.status === "active" && renderActive && renderActive()}

      {/* Flash effect */}
      {state.showFlash && (
        <div className="absolute inset-0 animate-pulse bg-white opacity-80" />
      )}

      {/* Custom overlays - Render Prop */}
      {renderOverlay && renderOverlay(state)}

      {/* Completion - Render Prop */}
      {state.isCompleted && renderCompletion && renderCompletion()}

      {/* Children as render prop */}
      {children && children(state)}
    </div>
  )
}
