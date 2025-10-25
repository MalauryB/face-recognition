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
    <div className="relative md:aspect-[4/3] bg-muted flex-1 min-h-0">
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover scale-x-[-1] ${
          state.status === "idle" ? "hidden" : ""
        }`}
      />

      {/* Idle state - Render Prop */}
      {state.status === "idle" && renderIdle && renderIdle()}

      {/* Active state - Render Prop */}
      {state.status === "active" && renderActive && renderActive()}

      {/* Capture effect */}
      {state.showFlash && (
        <>
          {/* Ripple effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#0ea5e9]/30 animate-capture-ripple" />
          </div>
          {/* Border flash */}
          <div className="absolute inset-0 border-[#0ea5e9] rounded-2xl md:rounded-3xl animate-capture-border pointer-events-none" />
          {/* Success checkmark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#0ea5e9] flex items-center justify-center animate-capture-checkmark">
              <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </>
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
