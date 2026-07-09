import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private renderer: Renderer2;
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Cargar un archivo de audio
   * @param name Nombre para identificar el audio
   * @param src Ruta del archivo de audio
   */
  loadAudio(name: string, src: string): void {
    if (this.audioElements.has(name)) {
      return;
    }

    const audio = new Audio();
    audio.id = `audio-${name}`;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.src = src;

    this.renderer.appendChild(this.document.body, audio);
    this.audioElements.set(name, audio);
  }

  /**
   * Reproducir un audio cargado
   * @param name Nombre del audio a reproducir
   * @param volume Volumen (0-1), por defecto 1
   */
  play(name: string, volume: number = 1): Promise<void> {
    const audio = this.audioElements.get(name);

    if (!audio) {
      console.warn(`Audio "${name}" no está cargado`);
      return Promise.reject(new Error(`Audio "${name}" no encontrado`));
    }

    return new Promise((resolve, reject) => {
      try {
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.currentTime = 0;
        audio.muted = false;

        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Audio "${name}" reproduciendo`);
              resolve();
            })
            .catch(err => {
              console.error(`Error reproduciendo audio "${name}":`, err);
              reject(err);
            });
        } else {
          resolve();
        }
      } catch (err) {
        console.error(`Error al reproducir audio "${name}":`, err);
        reject(err);
      }
    });
  }

  /**
   * Detener un audio
   * @param name Nombre del audio a detener
   */
  stop(name: string): void {
    const audio = this.audioElements.get(name);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Detener todos los audios
   */
  stopAll(): void {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Descargar un audio del DOM
   * @param name Nombre del audio a descargar
   */
  unload(name: string): void {
    const audio = this.audioElements.get(name);
    if (audio) {
      audio.pause();
      this.renderer.removeChild(this.document.body, audio);
      this.audioElements.delete(name);
    }
  }

  /**
   * Descargar todos los audios
   */
  unloadAll(): void {
    this.audioElements.forEach((audio, name) => {
      this.unload(name);
    });
  }
}

