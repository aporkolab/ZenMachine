import 'jest-preset-angular/setup-jest';
import 'zone.js';
import 'zone.js/testing';

// Mock necessary browser APIs for testing
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      gain: { value: 1 },
    }),
    createBiquadFilter: jest.fn().mockReturnValue({
      connect: jest.fn().mockReturnValue({
        connect: jest.fn(),
      }),
      frequency: { value: 1000 },
      gain: { value: 0 },
      type: 'lowshelf',
    }),
    createStereoPanner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      pan: { value: 0 },
    }),
    createAnalyser: jest.fn().mockReturnValue({
      connect: jest.fn(),
      getByteFrequencyData: jest.fn(),
      frequencyBinCount: 1024,
      fftSize: 2048,
    }),
    createBufferSource: jest.fn().mockReturnValue({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      buffer: null,
      loop: false,
      playbackRate: { value: 1 },
    }),
    decodeAudioData: jest.fn().mockResolvedValue({}),
    resume: jest.fn().mockResolvedValue(undefined),
    state: 'running',
    destination: {},
  })),
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: window.AudioContext,
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(() => null),
    removeItem: jest.fn(() => null),
    clear: jest.fn(() => null),
  },
  writable: true,
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    ...window.performance,
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => [{ duration: 100 }]),
    getEntriesByType: jest.fn(() => [{ startTime: 100, name: 'first-contentful-paint' }]),
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});

// Mock PerformanceObserver
(global as any).PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
) as jest.Mock;