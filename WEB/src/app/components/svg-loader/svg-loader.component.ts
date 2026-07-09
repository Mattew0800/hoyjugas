import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-svg-loader',
  standalone: true,
  template: `
    <div class="svg-container" [innerHTML]="svgContent"></div>
  `,
  styles: [`
    .svg-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class SvgLoaderComponent implements OnInit {
  @Input() svgPath: string = '';
  svgContent: SafeHtml | null = null;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.svgPath) {
      this.http.get(this.svgPath, { responseType: 'text' }).subscribe({
        next: (svg: string) => {
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
        },
        error: (err: any) => {
          console.error('Error loading SVG:', err);
        }
      });
    }
  }
}



