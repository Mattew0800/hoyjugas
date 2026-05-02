import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {RouterLink} from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { SvgLoaderComponent } from '../../components/svg-loader/svg-loader.component';

@Component({
  selector: 'app-onboarding',
  imports: [RouterLink, SvgLoaderComponent],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding implements OnInit, OnDestroy {
  window=window;
  currentStep: 'splash' | 'onboarding' = 'splash';

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.setStyle(this.document.body, 'background-color', '#000000');
    // Para cuando uses una imagen de fondo en el body, podrías hacer:
    // this.renderer.setStyle(this.document.body, 'background-image', "url('...')");

    // Mostrar splash (logo) durante 2 segundos
    setTimeout(() => {
      this.currentStep = 'onboarding';
      this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
      this.renderer.setStyle(this.document.body, 'background-color', '#181b16');
      // this.renderer.setStyle(this.document.body, 'background-image', "url('tu-imagen-aqui.jpg')");
      // this.renderer.setStyle(this.document.body, 'background-size', 'cover');
    }, 2000);
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
    this.renderer.removeStyle(this.document.body, 'background-image');
    this.renderer.removeStyle(this.document.body, 'background-size');
  }
}
