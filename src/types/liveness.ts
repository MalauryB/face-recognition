export type Pose = "left" | "center" | "right"
export type CaptureStatus = "idle" | "active" | "capturing" | "completed"

export interface Capture {
  pose: Pose
  dataUrl: string
  timestamp: number
}

export interface PoseConfig {
  id: Pose
  label: string
  instruction: string
}

export const POSES: PoseConfig[] = [
  { id: "left", label: "Gauche", instruction: "Tournez la tête vers la gauche" },
  { id: "center", label: "Centre", instruction: "Regardez droit devant vous" },
  { id: "right", label: "Droite", instruction: "Tournez la tête vers la droite" },
]
