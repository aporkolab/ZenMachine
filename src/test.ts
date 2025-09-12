// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp,
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Mock Web Audio API for testing
(
  window as typeof window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
).AudioContext =
  (
    window as typeof window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    }
  ).AudioContext ||
  (
    window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }
  ).webkitAudioContext ||
  class {
    createGain() {
      return {
        connect: () => ({ connect: () => {} }),
        gain: { value: 1 },
      };
    }
    createBiquadFilter() {
      return {
        connect: () => ({ connect: () => {} }),
        frequency: { value: 1000 },
        gain: { value: 0 },
        type: 'lowshelf',
      };
    }
    createStereoPanner() {
      return {
        connect: () => {},
        pan: { value: 0 },
      };
    }
    createAnalyser() {
      return {
        connect: () => {},
        getByteFrequencyData: () => {},
        frequencyBinCount: 1024,
        fftSize: 2048,
      };
    }
    createBufferSource() {
      return {
        connect: () => {},
        start: () => {},
        stop: () => {},
        disconnect: () => {},
        buffer: null,
        loop: false,
        playbackRate: { value: 1 },
      };
    }
    decodeAudioData() {
      return Promise.resolve({});
    }
    resume() {
      return Promise.resolve();
    }
    get state() {
      return 'running';
    }
    get destination() {
      return {};
    }
  };

// Mock PerformanceObserver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).PerformanceObserver = class {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: PerformanceObserverCallback) {
    // Mock constructor - callback parameter required by interface but not used
  }
  observe() {}
  disconnect() {}
  static get supportedEntryTypes() {
    return ['measure', 'navigation'];
  }
};

// Mock performance.mark and measure
if (!window.performance.mark) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.performance as any).mark = () => {};
}
if (!window.performance.measure) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window.performance as any).measure = () => {};
}
if (!window.performance.getEntriesByName) {
  (
    window.performance as Performance & {
      getEntriesByName?: (name: string) => PerformanceEntry[];
    }
  ).getEntriesByName = () => [
    {
      duration: 100,
      entryType: 'measure',
      name: 'test',
      startTime: 0,
      toJSON: () => ({}),
    } as PerformanceEntry,
  ];
}
if (!window.performance.getEntriesByType) {
  (
    window.performance as Performance & {
      getEntriesByType?: (type: string) => PerformanceEntry[];
    }
  ).getEntriesByType = () => [
    {
      startTime: 100,
      name: 'first-contentful-paint',
      duration: 100,
      entryType: 'paint',
      toJSON: () => ({}),
    } as PerformanceEntry,
  ];
}

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
