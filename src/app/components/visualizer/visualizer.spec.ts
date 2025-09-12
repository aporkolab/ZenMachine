import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { AudioService } from '../../services/audio';

import { VisualizerComponent } from './visualizer';

describe('VisualizerComponent', () => {
  let component: VisualizerComponent;
  let fixture: ComponentFixture<VisualizerComponent>;
  let mockAudioService: jasmine.SpyObj<AudioService>;

  beforeEach(async () => {
    // Create mock AudioService
    mockAudioService = jasmine.createSpyObj('AudioService', ['getAnalyser']);

    // Mock AnalyserNode with getByteFrequencyData
    const mockAnalyser = {
      frequencyBinCount: 128,
      getByteFrequencyData: jasmine
        .createSpy('getByteFrequencyData')
        .and.callFake((array: Uint8Array) => {
          // Fill with some mock data
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 255);
          }
        }),
    };

    mockAudioService.getAnalyser.and.returnValue(mockAnalyser as unknown as AnalyserNode);

    await TestBed.configureTestingModule({
      imports: [VisualizerComponent],
      providers: [
        { provide: AudioService, useValue: mockAudioService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
