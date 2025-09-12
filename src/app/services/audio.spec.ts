import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { AudioService } from './audio';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    // Create a chainable connect mock
    const createConnectable = () => {
      const connectable = {
        connect: jasmine.createSpy('connect'),
      };
      connectable.connect.and.returnValue(connectable);
      return connectable;
    };

    // Mock Web Audio API
    const mockAudioContext = {
      createGain: jasmine.createSpy('createGain').and.returnValue({
        ...createConnectable(),
        gain: { value: 1 },
      }),
      createAnalyser: jasmine.createSpy('createAnalyser').and.returnValue(createConnectable()),
      createBufferSource: jasmine.createSpy('createBufferSource').and.returnValue({
        ...createConnectable(),
        start: jasmine.createSpy('start'),
        buffer: null,
        loop: false,
        playbackRate: { value: 1 },
      }),
      decodeAudioData: jasmine.createSpy('decodeAudioData').and.returnValue(Promise.resolve({})),
      destination: {},
      state: 'running',
      resume: jasmine.createSpy('resume').and.returnValue(Promise.resolve()),
    };

    const mockBiquadFilterNode = jasmine.createSpy('BiquadFilterNode').and.returnValue({
      ...createConnectable(),
      gain: { value: 0 },
    });

    const mockStereoPannerNode = jasmine.createSpy('StereoPannerNode').and.returnValue({
      ...createConnectable(),
      disconnect: jasmine.createSpy('disconnect'),
      pan: { value: 0 },
    });

    (globalThis as any).AudioContext = jasmine.createSpy('AudioContext').and.returnValue(mockAudioContext);
    (globalThis as any).BiquadFilterNode = mockBiquadFilterNode;
    (globalThis as any).StereoPannerNode = mockStereoPannerNode;
    (globalThis as any).Audio = jasmine.createSpy('Audio').and.returnValue({
      load: jasmine.createSpy('load'),
    });

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have an audio context after init', () => {
    service.init();
    expect((service as any).ctx).toBeDefined();
  });

  it('should have a master gain node after init', () => {
    service.init();
    expect((service as any).masterGainNode).toBeDefined();
  });
});
