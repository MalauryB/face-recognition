import { Camera, Download, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeadAvatar } from "@/components/head-avatar"
import { Capture, CaptureStatus, POSES, PoseConfig } from "@/types/liveness"
import { LivenessVideoArea } from "./LivenessVideoArea"
import { LivenessStepsList } from "./LivenessStepsList"
import { LivenessCaptureGallery } from "./LivenessCaptureGallery"

interface LivenessCheckPresenterProps {
  // State
  status: CaptureStatus
  currentPose: PoseConfig
  captures: Capture[]
  progress: number
  showFlash: boolean
  isCompleted: boolean

  // Refs
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>

  // Handlers
  onStartCapture: () => void
  onResetCapture: () => void
  onDownloadCapture: (capture: Capture) => void
}

export function LivenessCheckPresenter({
  status,
  currentPose,
  captures,
  progress,
  showFlash,
  isCompleted,
  videoRef,
  canvasRef,
  onStartCapture,
  onResetCapture,
  onDownloadCapture,
}: LivenessCheckPresenterProps) {
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
          <h1 className="mb-1 text-2xl md:text-3xl font-bold tracking-tight text-foreground text-balance">
            Vérification d'identité
          </h1>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            Bougez lentement la tête pour capturer trois angles de votre visage.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 flex-1 min-h-0">
          {/* Main Video Area */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card w-full mx-auto flex flex-col max-h-[65vh]">
              {/* Video Area with Render Props */}
              <LivenessVideoArea
                videoRef={videoRef}
                canvasRef={canvasRef}
                state={{
                  status,
                  progress,
                  showFlash,
                  isCompleted,
                }}
                renderIdle={() => (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="mx-auto mb-2 h-12 w-12 md:h-16 md:w-16 text-muted-foreground/50" />
                      <p className="text-sm md:text-base text-muted-foreground">Caméra inactive</p>
                    </div>
                  </div>
                )}
                renderActive={() => (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-48 w-36 md:h-64 md:w-48 rounded-full border-4 border-dashed border-[#00B4D8] opacity-50" />
                  </div>
                )}
                renderOverlay={(state) => (
                  <>
                    {/* Status Overlay */}
                    {state.status !== "idle" && (
                      <div className="absolute left-2 top-2 md:left-4 md:top-4 rounded-full border border-border bg-card px-3 py-1.5 md:px-4 md:py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                          <span className="text-xs md:text-sm font-medium text-card-foreground">
                            {state.status === "capturing" ? "Capture..." : "Active"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Progress Indicator */}
                    {state.status !== "idle" && (
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
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - state.progress / 100)}`}
                              className="text-[#0ea5e9] dark:text-[#38bdf8] transition-all duration-500"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs md:text-sm font-bold text-foreground">{Math.round(state.progress)}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                renderCompletion={() => (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/95 backdrop-blur-sm">
                    <div className="text-center px-4">
                      <CheckCircle2 className="mx-auto mb-2 md:mb-4 h-12 w-12 md:h-16 md:w-16 text-green-500" />
                      <h3 className="mb-1 md:mb-2 text-lg md:text-2xl font-bold text-foreground">Vérification terminée !</h3>
                      <p className="text-sm md:text-base text-muted-foreground">Toutes les photos ont été capturées.</p>
                    </div>
                  </div>
                )}
              />

              {/* Action Button */}
              <div className="border-t border-border p-3 md:p-4">
                {status === "idle" && (
                  <Button
                    onClick={onStartCapture}
                    className="w-full rounded-full bg-[#0ea5e9] text-sm md:text-base font-semibold text-white hover:bg-[#0284c7] dark:bg-[#38bdf8] dark:hover:bg-[#0ea5e9]"
                    size="default"
                  >
                    <Camera className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Démarrer la vérification
                  </Button>
                )}
                {isCompleted && (
                  <Button
                    onClick={onResetCapture}
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
                    <span className="text-base md:text-lg font-bold text-white">
                      {POSES.findIndex(p => p.id === currentPose.id) + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-white/90">
                      Étape {POSES.findIndex(p => p.id === currentPose.id) + 1}/3
                    </p>
                    <p className="text-sm md:text-base font-semibold text-white truncate">{currentPose.instruction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Steps & Captures */}
          <div className="space-y-3 md:space-y-4 overflow-y-auto">
            {/* Steps Progress with Render Props */}
            <LivenessStepsList
              poses={POSES}
              captures={captures}
              currentPose={currentPose}
              status={status}
              renderStep={(stepData) => (
                <div
                  className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
                    stepData.isCurrent ? "bg-[#0ea5e9]/10 dark:bg-[#38bdf8]/10" : ""
                  }`}
                >
                  <HeadAvatar direction={stepData.pose.id} className="shrink-0 opacity-60 scale-75 md:scale-100" />
                  {stepData.isCaptured ? (
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-muted-foreground/50" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs md:text-sm font-medium ${stepData.isCaptured ? "text-green-600 dark:text-green-500" : "text-foreground"}`}>
                      {stepData.pose.label}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{stepData.pose.instruction}</p>
                  </div>
                </div>
              )}
            />

            {/* Captured Photos Gallery with Render Props */}
            <LivenessCaptureGallery
              captures={captures}
              poses={POSES}
              onDownload={onDownloadCapture}
              renderCapture={(itemData, onDownload) => (
                <div className="group relative overflow-hidden rounded-lg border border-border bg-muted">
                  <div className="aspect-[4/3]">
                    <img
                      src={itemData.capture.dataUrl || "/placeholder.svg"}
                      alt={`Capture ${itemData.poseInfo?.label}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-border p-2">
                    <span className="text-xs md:text-sm font-medium text-foreground">{itemData.poseInfo?.label}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownload(itemData.capture)}
                      className="h-7 w-7 p-0 text-[#0ea5e9] hover:bg-[#0ea5e9]/10 dark:text-[#38bdf8] dark:hover:bg-[#38bdf8]/10"
                    >
                      <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
