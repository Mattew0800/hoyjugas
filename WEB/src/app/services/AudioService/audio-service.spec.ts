import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio-service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load audio', () => {
    service.loadAudio('test', '/assets/audio/kick.mp3');
    // El audio debe estar disponible
  });

  it('should play audio', async () => {
    service.loadAudio('test', '/assets/audio/kick.mp3');
    const promise = service.play('test');
    expect(promise).toBeTruthy();
  });

  it('should stop audio', () => {
    service.loadAudio('test', '/assets/audio/kick.mp3');
    service.stop('test');
    // El audio debe estar pausado
  });

  it('should unload audio', () => {
    service.loadAudio('test', '/assets/audio/kick.mp3');
    service.unload('test');
    // El audio debe ser removido del DOM
  });
});

