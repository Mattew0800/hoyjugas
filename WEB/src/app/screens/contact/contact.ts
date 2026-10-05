import {Component, Inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Header} from '../header/header';
import {BottomNavbar} from '../bottom-navbar/bottom-navbar';
import {Router, RouterLink} from '@angular/router';
import {Meta} from '@angular/platform-browser';
import {DOCUMENT} from '@angular/common';
import {BookingService} from '../../services/BookingService/booking-service';
import {ContactTopic} from '../../models/ContactTopic';

@Component({
  selector: 'app-contact',
  imports: [Header, BottomNavbar],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit, OnDestroy{


  // TODO: reemplazar por el número real del complejo.
  // Formato internacional, solo dígitos (cód. país + área + número, sin '+', espacios ni guiones).
  private readonly whatsappNumber = '5491122334455';

  readonly defaultMessage = 'Hola! Quería hacer una consulta sobre AZTK Arena.';

  readonly businessHours = '9:00 a 22:00 hs';
  readonly avgResponseTime = '~10 min';


  readonly topics: ContactTopic[] = [
    {
      id: 'reservar',
      label: 'Reservar una cancha',
      message: 'Hola! Quiero reservar una cancha.',
      webAlternative: {
        title: '¡Podés reservar desde la web!',
        description: 'Reservá tu cancha de forma rápida y sencilla sin salir de la página.',
        buttonText: 'Ir a Reservar',
        route: '/booking'
      }
    },
    {
      id: 'modificar',
      label: 'Modificar o cancelar un turno',
      message: 'Hola! Necesito modificar o cancelar un turno que ya tengo reservado.',
      webAlternative: {
        title: '¡Podés gestionar tus turnos desde la web!',
        description: 'Revisá, modificá o cancelá tus turnos actuales desde tu perfil.',
        buttonText: 'Ir a Mis Turnos',
        route: '/my-bookings'
      }
    },
    {
      id: 'precios',
      label: 'Consultar precios',
      message: 'Hola! Quería consultar los precios de las canchas.'
    },
    {
      id: 'otro',
      label: 'Otra consulta',
      message: 'Hola! Tengo una consulta sobre AZTK Arena.'
    }
  ];

  selectedTopic: ContactTopic | null = null;
  showModal: boolean = false;

  constructor(
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router
  ) { }

  ngOnInit() {
    this.meta.updateTag({ name: 'theme-color', content: '#181b16' });
    this.renderer.setStyle(this.document.body, 'background-color', '#CEA764');
  }

  ngOnDestroy() {
    this.meta.updateTag({ name: 'theme-color', content: '#000000' });
    this.renderer.removeStyle(this.document.body, 'background-color');
  }

  get phoneHref(): string {
    return `tel:+${this.whatsappNumber}`;
  }

  whatsappUrl(message: string): string {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  handleTopicClick(topic: ContactTopic, event: Event) {
    if (topic.webAlternative) {
      event.preventDefault();
      this.selectedTopic = topic;
      this.showModal = true;
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedTopic = null;
  }

  goToWebAlternative() {
    if (this.selectedTopic?.webAlternative?.route) {
      this.router.navigate([this.selectedTopic.webAlternative.route]);
    }
  }
}
