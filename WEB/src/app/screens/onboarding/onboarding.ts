import { Component, OnInit, OnDestroy, Inject, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SvgLoaderComponent } from '../../components/svg-loader/svg-loader.component';
import { AudioService } from '../../services/AudioService/audio-service';

@Component({
  selector: 'app-onboarding',
  imports: [SvgLoaderComponent],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding implements OnInit, OnDestroy {
  window = window;
  @ViewChild('ballImage') ballImage!: ElementRef;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private audioService: AudioService
  ) {}

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
    this.audioService.loadAudio('kick', '/assets/audio/kick.mp3');
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
    this.audioService.unload('kick');
  }

  onContinueClick() {
    /*
    this.audioService.play('kick', 0.4).catch(err => {
      console.warn('No se pudo reproducir el audio:', err);
    });
    */

    if (this.ballImage) {
      this.renderer.addClass(
        this.ballImage.nativeElement,
        'shoot'
      );

      setTimeout(() => {
        this.router.navigate(['/sign-in']);
      }, 1500);

    }
  }
}
