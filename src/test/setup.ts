import '@testing-library/jest-dom'

// Mock HTMLMediaElement
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve())
  HTMLMediaElement.prototype.pause = jest.fn()
  HTMLMediaElement.prototype.load = jest.fn()
}

// Mock getUserMedia
Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [{ stop: jest.fn() }],
        getVideoTracks: () => [{ stop: jest.fn() }],
      } as any)
    ),
  },
})

// Mock Canvas
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  })) as any

  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock')
}
