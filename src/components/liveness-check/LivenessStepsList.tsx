import { Capture, PoseConfig, CaptureStatus } from "@/types/liveness"

interface StepItemData {
  pose: PoseConfig
  index: number
  isCaptured: boolean
  isCurrent: boolean
}

interface LivenessStepsListProps {
  poses: PoseConfig[]
  captures: Capture[]
  currentPose: PoseConfig
  status: CaptureStatus
  // Render Props
  renderStep?: (data: StepItemData) => React.ReactNode
  renderHeader?: () => React.ReactNode
  children?: (steps: StepItemData[]) => React.ReactNode
}

export function LivenessStepsList({
  poses,
  captures,
  currentPose,
  status,
  renderStep,
  renderHeader,
  children,
}: LivenessStepsListProps) {
  const steps: StepItemData[] = poses.map((pose, index) => ({
    pose,
    index,
    isCaptured: captures.some((c) => c.pose === pose.id),
    isCurrent: pose.id === currentPose.id && status === "active",
  }))

  return (
    <div className="rounded-2xl md:rounded-3xl border border-border bg-card p-3 md:p-4 mb-4 md:mb-0">
      {/* Custom header - Render Prop */}
      {renderHeader ? (
        renderHeader()
      ) : (
        <h3 className="mb-2 md:mb-3 text-base md:text-lg font-semibold text-foreground">
          Étapes
        </h3>
      )}

      <div className="space-y-2">
        {/* Children as render prop with all steps */}
        {children ? (
          children(steps)
        ) : (
          // Default rendering with renderStep
          steps.map((stepData) =>
            renderStep ? (
              <div key={stepData.pose.id}>{renderStep(stepData)}</div>
            ) : null
          )
        )}
      </div>
    </div>
  )
}
