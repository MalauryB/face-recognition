import { useState, useEffect, useRef } from "react"
import { Camera, Download, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeadAvatar } from "./head-avatar"

type Pose = "left" | "center" | "right"
type CaptureStatus = "idle" | "active" | "capturing" | "completed"

interface Capture {
  pose: Pose
  dataUrl: string
  timestamp: number
}

const POSES: { id: Pose; label: string; instruction: string }[] = [
  { id: "left", label: "Gauche", instruction: "Tournez la tête vers la gauche" },
  { id: "center", label: "Centre", instruction: "Regardez droit devant vous" },
  { id: "right", label: "Droite", instruction: "Tournez la tête vers la droite" },
]

export default function LivenessCheck() {
  const [status, setStatus] = useState<CaptureStatus>("idle")
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0)
  const [captures, setCaptures] = useState<Capture[]>([])
  const [progress, setProgress] = useState(0)
  const [showFlash, setShowFlash] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentPose = POSES[currentPoseIndex]
  const isCompleted = captures.length === 3

  // Simulate camera initialization
  useEffect(() => {
    if (status === "active" && videoRef.current) {
      // In a real implementation, you would access the user's camera here
      // navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    }
  }, [status])

  // Simulate automatic capture progression
  useEffect(() => {
    if (status === "active" && !isCompleted) {
      const timer = setTimeout(() => {
        capturePhoto()
      }, 3000) // Auto-capture after 3 seconds per pose

      return () => clearTimeout(timer)
    }
  }, [status, currentPoseIndex, isCompleted])

  // Update progress
  useEffect(() => {
    setProgress((captures.length / 3) * 100)
  }, [captures.length])

  const startCapture = () => {
    setStatus("active")
    setCaptures([])
    setCurrentPoseIndex(0)
    setProgress(0)
  }

  const capturePhoto = () => {
    setStatus("capturing")
    setShowFlash(true)

    // Simulate photo capture
    setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Create a placeholder image with gradient
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
          gradient.addColorStop(0, "#1e293b")
          gradient.addColorStop(1, "#334155")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Add text indicating the pose
          ctx.fillStyle = "#ffffff"
          ctx.font = "24px Inter"
          ctx.textAlign = "center"
          ctx.fillText(currentPose.label, canvas.width / 2, canvas.height / 2)

          const dataUrl = canvas.toDataURL("image/jpeg")
          const newCapture: Capture = {
            pose: currentPose.id,
            dataUrl,
            timestamp: Date.now(),
          }

          setCaptures((prev) => [...prev, newCapture])
        }
      }

      setShowFlash(false)

      if (currentPoseIndex < POSES.length - 1) {
        setCurrentPoseIndex((prev) => prev + 1)
        setStatus("active")
      } else {
        setStatus("completed")
      }
    }, 500)
  }

  const downloadCapture = (capture: Capture) => {
    const link = document.createElement("a")
    link.href = capture.dataUrl
    link.download = `liveness-${capture.pose}-${capture.timestamp}.jpg`
    link.click()
  }

  const resetCapture = () => {
    setStatus("idle")
    setCaptures([])
    setCurrentPoseIndex(0)
    setProgress(0)
  }

  return (
    <div className="h-screen flex flex-col px-4 py-4 md:py-6">
      <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4 text-center">
          <img
            src="/logo.svg"
            alt="Logo Olky"
            className="h-12 md:h-16 mx-auto mb-3 md:mb-4"
          />
          <h1 className="mb-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground text-balance">Vérification d'identité</h1>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            Bougez lentement la tête pour capturer trois angles de votre visage.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 flex-1 min-h-0">
          {/* Main Video Area */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card w-full mx-auto flex flex-col max-h-[65vh]">
              {/* Video/Canvas Container */}
              <div className="relative aspect-[4/3] bg-muted max-h-[calc(65vh-60px)]">
                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} width={640} height={480} className="hidden" />

                {/* Video placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {status === "idle" ? (
                    <div className="text-center">
                      <Camera className="mx-auto mb-2 h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
                      <p className="text-sm md:text-base text-muted-foreground">Caméra inactive</p>
                    </div>
                  ) : (
                    <div className="relative h-full w-full">
                      {/* Simulated video feed */}
                      <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/80" />

                      {/* Face outline guide */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-48 w-36 md:h-64 md:w-48 rounded-full border-4 border-dashed border-[#00B4D8] opacity-50" />
                      </div>

                      {/* Flash effect */}
                      {showFlash && <div className="absolute inset-0 animate-pulse bg-white opacity-80" />}
                    </div>
                  )}
                </div>

                {/* Status Overlay */}
                {status !== "idle" && (
                  <div className="absolute left-2 top-2 md:left-4 md:top-4 rounded-full border border-border bg-card px-3 py-1.5 md:px-4 md:py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                      <span className="text-xs md:text-sm font-medium text-card-foreground">
                        {status === "capturing" ? "Capture..." : "Active"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Progress Indicator */}
                {status !== "idle" && (
                  <div className="absolute right-2 top-2 md:right-4 md:top-4">
                    <div className="relative h-12 w-12 md:h-16 md:w-16">
                      <svg className="h-12 w-12 md:h-16 md:w-16 -rotate-90 transform" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                          className="text-[#0ea5e9] dark:text-[#38bdf8] transition-all duration-500"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs md:text-sm font-bold text-foreground">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completion Message */}
                {isCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/95 backdrop-blur-sm">
                    <div className="text-center px-4">
                      <CheckCircle2 className="mx-auto mb-2 md:mb-4 h-12 w-12 md:h-16 md:w-16 text-green-500" />
                      <h3 className="mb-1 md:mb-2 text-lg md:text-2xl font-bold text-foreground">Vérification terminée !</h3>
                      <p className="text-sm md:text-base text-muted-foreground">Toutes les photos ont été capturées.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="border-t border-border p-3 md:p-4">
                {status === "idle" && (
                  <Button
                    onClick={startCapture}
                    className="w-full rounded-full bg-[#0ea5e9] text-sm md:text-base font-semibold text-white hover:bg-[#0284c7] dark:bg-[#38bdf8] dark:hover:bg-[#0ea5e9]"
                    size="default"
                  >
                    <Camera className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Démarrer la vérification
                  </Button>
                )}
                {isCompleted && (
                  <Button
                    onClick={resetCapture}
                    className="w-full rounded-full border-2 border-[#0ea5e9] bg-card text-sm md:text-base font-semibold text-[#0ea5e9] hover:bg-muted dark:border-[#38bdf8] dark:text-[#38bdf8]"
                    size="default"
                  >
                    Recommencer
                  </Button>
                )}
              </div>
            </div>

            {/* Instructions Box - Below camera */}
            {status === "active" && (
              <div className="mt-3 md:mt-4 rounded-xl md:rounded-2xl bg-[#0ea5e9] p-2.5 md:p-4 max-w-xl mx-auto w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <HeadAvatar direction={currentPose.id} className="shrink-0 scale-75 md:scale-100" />
                  <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <span className="text-base md:text-lg font-bold text-white">{currentPoseIndex + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-white/90">Étape {currentPoseIndex + 1}/3</p>
                    <p className="text-sm md:text-base font-semibold text-white truncate">{currentPose.instruction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Steps & Captures */}
          <div className="space-y-3 md:space-y-4 overflow-y-auto">
            {/* Steps Progress */}
            <div className="rounded-2xl md:rounded-3xl border border-border bg-card p-3 md:p-4 mb-4 md:mb-0">
              <h3 className="mb-2 md:mb-3 text-base md:text-lg font-semibold text-foreground">Étapes</h3>
              <div className="space-y-2">
                {POSES.map((pose, index) => {
                  const isCaptured = captures.some((c) => c.pose === pose.id)
                  const isCurrent = index === currentPoseIndex && status === "active"

                  return (
                    <div
                      key={pose.id}
                      className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
                        isCurrent ? "bg-[#0ea5e9]/10 dark:bg-[#38bdf8]/10" : ""
                      }`}
                    >
                      <HeadAvatar direction={pose.id} className="shrink-0 opacity-60 scale-75 md:scale-100" />
                      {isCaptured ? (
                        <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-muted-foreground/50" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs md:text-sm font-medium ${isCaptured ? "text-green-600 dark:text-green-500" : "text-foreground"}`}>
                          {pose.label}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground truncate">{pose.instruction}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Captured Photos Gallery */}
            {captures.length > 0 && (
              <div className="rounded-2xl md:rounded-3xl border border-border bg-card p-3 md:p-4 mb-4 md:mb-0">
                <h3 className="mb-2 md:mb-3 text-base md:text-lg font-semibold text-foreground">Photos capturées</h3>
                <div className="space-y-2">
                  {captures.map((capture) => {
                    const poseInfo = POSES.find((p) => p.id === capture.pose)
                    return (
                      <div
                        key={capture.timestamp}
                        className="group relative overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <div className="aspect-[4/3]">
                          <img
                            src={capture.dataUrl || "/placeholder.svg"}
                            alt={`Capture ${poseInfo?.label}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between border-t border-border p-2">
                          <span className="text-xs md:text-sm font-medium text-foreground">{poseInfo?.label}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadCapture(capture)}
                            className="h-7 w-7 p-0 text-[#0ea5e9] hover:bg-[#0ea5e9]/10 dark:text-[#38bdf8] dark:hover:bg-[#38bdf8]/10"
                          >
                            <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
