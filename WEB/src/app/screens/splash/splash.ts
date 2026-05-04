import { Component, OnInit, OnDestroy, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SvgLoaderComponent } from '../../components/svg-loader/svg-loader.component';

@Component({
  selector: 'app-splash',
  imports: [SvgLoaderComponent],
  templateUrl: './splash.html',
  styleUrl: './splash.scss',
})
export class SplashComponent implements OnInit, OnDestroy {
  window = window;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.setStyle(this.document.body, 'background-color', '#000000');

    // Redirigir a onboarding después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/onboarding']);
    }, 2000);
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }
}
