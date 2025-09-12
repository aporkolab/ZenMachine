import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AudioService } from '../../src/app/services/audio';

describe('AudioService Integration Tests', () => {
  let service: AudioService;

  beforeEach(() => {
    // Mock Web Audio API globally
    const createConnectable = () => {
      const connectable = {
        connect: jest.fn()
      };
      connectable.connect.mockReturnValue(connectable);
      return connectable;
    };

    const mockAudioContext = {
      createGain: jest.fn().mockReturnValue({
        ...createConnectable(),
        gain: { value: 1 }
      }),
      createAnalyser: jest.fn().mockReturnValue(createConnectable()),
      createBufferSource: jest.fn().mockReturnValue({
        ...createConnectable(),
        start: jest.fn(),
        stop: jest.fn(),
        disconnect: jest.fn(),
        buffer: null,
        loop: false,
        playbackRate: { value: 1 }
      }),
      decodeAudioData: jest.fn().mockResolvedValue({}),
      destination: {},
      state: 'running',
      resume: jest.fn().mockResolvedValue(undefined)
    };

    (global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);
    (global as any).BiquadFilterNode = jest.fn().mockImplementation(() => ({
      ...createConnectable(),
      gain: { value: 0 },
      frequency: { value: 1000 }
    }));
    (global as any).StereoPannerNode = jest.fn().mockImplementation(() => ({
      ...createConnectable(),
      disconnect: jest.fn(),
      pan: { value: 0 }
    }));
    (global as any).Audio = jest.fn().mockImplementation(() => ({
      load: jest.fn(),
      play: jest.fn().mockResolvedValue(undefined)
    }));

    TestBed.configureTestingModule({
      providers: [
        AudioService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize audio context when init is called', () => {
    service.init();
    
    expect((global as any).AudioContext).toHaveBeenCalled();
  });

  it('should handle service interactions without errors', () => {
    service.setMasterVolume(0.5);
    service.setPan(0.2);
    service.setEQ('bass', 5);
    service.setEQ('mid', -2);
    service.setEQ('treble', 3);
    
    const settings = service.getSettings();
    expect(settings.volume).toBe(0.5);
    expect(settings.pan).toBe(0.2);
    expect(settings.bass).toBe(5);
    expect(settings.mid).toBe(-2);
    expect(settings.treble).toBe(3);
  });
});