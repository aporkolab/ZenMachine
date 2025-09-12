import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ZenPadComponent } from './zen-pad';
import { AudioService } from '../../services/audio';

describe('ZenPadComponent', () => {
  let component: ZenPadComponent;
  let fixture: ComponentFixture<ZenPadComponent>;
  let audioService: AudioService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZenPadComponent, NoopAnimationsModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZenPadComponent);
    component = fixture.componentInstance;
    audioService = TestBed.inject(AudioService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call audioService.loadSound and audioService.playSound when addSound is called', async () => {
    const loadSoundSpy = spyOn(audioService, 'loadSound').and.returnValue(Promise.resolve({} as AudioBuffer));
    const playSoundSpy = spyOn(audioService, 'playSound');

    component.selectedSoundPath = 'assets/sounds/heavy-rain.mp3';
    await component.addSound();

    expect(loadSoundSpy).toHaveBeenCalledWith('assets/sounds/heavy-rain.mp3');
    expect(playSoundSpy).toHaveBeenCalled();
  });


  it('should set the background image when changeBackground is called with a path', () => {
    component.selectedBackground = 'assets/image/beach.jpg';
    component.changeBackground();
    expect(document.body.style.backgroundImage).toBe('url("assets/image/beach.jpg")');
  });
});
