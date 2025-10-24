import { render, screen } from '@testing-library/react'

import { LivenessStepsList } from './LivenessStepsList'
import { POSES } from '@/types/liveness'
import type { Capture, CaptureStatus } from '@/types/liveness'

describe('LivenessStepsList', () => {
  const mockCaptures: Capture[] = [
    { pose: 'left', dataUrl: 'data:image/png;base64,left', timestamp: 1 },
  ]

  it('should render with default header', () => {
    render(
      <LivenessStepsList
        poses={POSES}
        captures={[]}
        currentPose={POSES[0]}
        status="idle"
      />
    )

    expect(screen.getByText('Étapes')).toBeInTheDocument()
  })

  it('should render custom header via renderHeader', () => {
    render(
      <LivenessStepsList
        poses={POSES}
        captures={[]}
        currentPose={POSES[0]}
        status="idle"
        renderHeader={() => <h3>Custom Steps Header</h3>}
      />
    )

    expect(screen.getByText('Custom Steps Header')).toBeInTheDocument()
    expect(screen.queryByText('Étapes')).not.toBeInTheDocument()
  })

  it('should call renderStep for each pose', () => {
    const renderStep = jest.fn((stepData) => (
      <div key={stepData.index} data-testid={`step-${stepData.pose.id}`}>
        {stepData.pose.label}
      </div>
    ))

    render(
      <LivenessStepsList
        poses={POSES}
        captures={[]}
        currentPose={POSES[0]}
        status="idle"
        renderStep={renderStep}
      />
    )

    expect(renderStep).toHaveBeenCalledTimes(3)
    expect(screen.getByTestId('step-left')).toBeInTheDocument()
    expect(screen.getByTestId('step-center')).toBeInTheDocument()
    expect(screen.getByTestId('step-right')).toBeInTheDocument()
  })

  it('should provide enriched step data with isCaptured flag', () => {
    const renderStep = jest.fn((stepData) => (
      <div key={stepData.index}>
        {stepData.pose.label}: {stepData.isCaptured ? 'Captured' : 'Pending'}
      </div>
    ))

    render(
      <LivenessStepsList
        poses={POSES}
        captures={mockCaptures}
        currentPose={POSES[1]}
        status="active"
        renderStep={renderStep}
      />
    )

    expect(renderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        pose: POSES[0],
        index: 0,
        isCaptured: true,
        isCurrent: false,
      })
    )

    expect(screen.getByText('Gauche: Captured')).toBeInTheDocument()
    expect(screen.getByText('Centre: Pending')).toBeInTheDocument()
  })

  it('should provide enriched step data with isCurrent flag', () => {
    const renderStep = jest.fn((stepData) => (
      <div key={stepData.index} className={stepData.isCurrent ? 'current' : ''}>
        {stepData.pose.label}
      </div>
    ))

    render(
      <LivenessStepsList
        poses={POSES}
        captures={[]}
        currentPose={POSES[1]} // Center is current
        status="active"
        renderStep={renderStep}
      />
    )

    expect(renderStep).toHaveBeenCalledWith(
      expect.objectContaining({
        pose: POSES[1],
        isCurrent: true,
      })
    )
  })

  it('should not mark as current when status is not active', () => {
    const renderStep = jest.fn((stepData) => (
      <div key={stepData.index}>{stepData.isCurrent ? 'Current' : 'Not Current'}</div>
    ))

    render(
      <LivenessStepsList
        poses={POSES}
        captures={[]}
        currentPose={POSES[0]}
        status="idle"
        renderStep={renderStep}
      />
    )

    expect(screen.queryByText('Current')).not.toBeInTheDocument()
    expect(screen.getAllByText('Not Current')).toHaveLength(3)
  })

  it('should support children render function', () => {
    render(
      <LivenessStepsList poses={POSES} captures={[]} currentPose={POSES[0]} status="idle">
        {(steps) => (
          <div>
            {steps.map((step) => (
              <div key={step.index} data-testid={`custom-step-${step.pose.id}`}>
                Custom: {step.pose.label}
              </div>
            ))}
          </div>
        )}
      </LivenessStepsList>
    )

    expect(screen.getByTestId('custom-step-left')).toHaveTextContent('Custom: Gauche')
    expect(screen.getByTestId('custom-step-center')).toHaveTextContent('Custom: Centre')
    expect(screen.getByTestId('custom-step-right')).toHaveTextContent('Custom: Droite')
  })

  it('should prefer children over renderStep', () => {
    const renderStep = jest.fn(() => <div>From renderStep</div>)

    render(
      <LivenessStepsList
        poses={POSES}
        captures={[]}
        currentPose={POSES[0]}
        status="idle"
        renderStep={renderStep}
      >
        {() => <div>From children</div>}
      </LivenessStepsList>
    )

    expect(screen.getByText('From children')).toBeInTheDocument()
    expect(screen.queryByText('From renderStep')).not.toBeInTheDocument()
    expect(renderStep).not.toHaveBeenCalled()
  })

  it('should render default steps when no render props provided', () => {
    render(
      <LivenessStepsList poses={POSES} captures={[]} currentPose={POSES[0]} status="idle" />
    )

    expect(screen.getByText('Gauche')).toBeInTheDocument()
    expect(screen.getByText('Centre')).toBeInTheDocument()
    expect(screen.getByText('Droite')).toBeInTheDocument()
  })

  it('should handle all poses captured', () => {
    const allCaptures: Capture[] = [
      { pose: 'left', dataUrl: 'data:1', timestamp: 1 },
      { pose: 'center', dataUrl: 'data:2', timestamp: 2 },
      { pose: 'right', dataUrl: 'data:3', timestamp: 3 },
    ]

    const renderStep = jest.fn((stepData) => (
      <div key={stepData.index}>{stepData.isCaptured ? '✓' : '○'}</div>
    ))

    render(
      <LivenessStepsList
        poses={POSES}
        captures={allCaptures}
        currentPose={POSES[2]}
        status="completed"
        renderStep={renderStep}
      />
    )

    expect(screen.getAllByText('✓')).toHaveLength(3)
  })
})
