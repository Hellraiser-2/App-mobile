import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRouterLink,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import type { Pedido } from '@rockstar/contracts';
import { addIcons } from 'ionicons';
import {
  clipboardOutline,
  downloadOutline,
  logOutOutline,
  qrCodeOutline,
  swapHorizontalOutline,
  timerOutline,
  trashOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

import { mensajeDeError } from '../../core/api/errores';
import { SesionService } from '../../core/sesion/sesion.service';
import { GRUPOS_DE_ENVIO, agruparEnvios } from '../envios/envios';
import { LogisticaApi } from '../envios/logistica.api';

interface Opcion {
  ruta: string;
  titulo: string;
  detalle: string;
  icono: string;
}

@Component({
  selector: 'app-inicio',
  imports: [
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRouterLink,
    IonTitle,
    IonToolbar,
    RouterLink,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Bodega</ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Cerrar sesión" (click)="cerrarSesion()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <p class="ion-padding-horizontal">Hola, {{ sesion.usuario()?.nombre }}</p>
      <ion-list>
        @for (opcion of opciones; track opcion.ruta) {
          <ion-item [routerLink]="opcion.ruta" detail>
            <ion-icon slot="start" [name]="opcion.icono" aria-hidden="true"></ion-icon>
            <ion-label>
              <h2>{{ opcion.titulo }}</h2>
              <p>{{ opcion.detalle }}</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>

      <ion-card button routerLink="/envios">
        <ion-card-header>
          <ion-card-title>Envíos</ion-card-title>
          <ion-card-subtitle>Pedidos del e-commerce</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          @if (errorEnvios(); as mensaje) {
            <p role="alert">{{ mensaje }}</p>
          } @else {
            <dl class="envios">
              @for (grupo of resumenEnvios(); track grupo.etiqueta) {
                <div>
                  <dd>{{ grupo.cantidad ?? '–' }}</dd>
                  <dt>{{ grupo.etiqueta }}</dt>
                </div>
              }
            </dl>
          }
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: `
    .envios {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin: 0;
      text-align: center;
    }
    dd {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
    }
    dt {
      font-size: 0.85rem;
      opacity: 0.8;
    }
  `,
})
export class InicioPage {
  protected readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly logistica = inject(LogisticaApi);

  protected readonly opciones: Opcion[] = [
    { ruta: '/consulta', titulo: 'Consultar producto', detalle: 'Existencias por ubicación', icono: 'qr-code-outline' },
    { ruta: '/ingreso', titulo: 'Ingreso de mercadería', detalle: 'Recibir prendas', icono: 'download-outline' },
    { ruta: '/merma', titulo: 'Registrar merma', detalle: 'Dañado, muestra o cambio', icono: 'trash-outline' },
    { ruta: '/traspaso', titulo: 'Traspaso', detalle: 'Entre bodega y sala de ventas', icono: 'swap-horizontal-outline' },
    { ruta: '/conteo', titulo: 'Conteo', detalle: 'Ajuste por conteo físico', icono: 'clipboard-outline' },
    { ruta: '/busqueda', titulo: 'Buscar prenda', detalle: 'Ubicar una prenda y medir el tiempo', icono: 'timer-outline' },
  ];

  /** `null` mientras los pedidos aún no se han cargado. */
  private readonly pedidos = signal<Pedido[] | null>(null);
  readonly errorEnvios = signal<string | null>(null);

  /** Cantidad de pedidos por enviar, en camino y enviados. */
  readonly resumenEnvios = computed(() => {
    const pedidos = this.pedidos();
    const envios = pedidos && agruparEnvios(pedidos);
    return GRUPOS_DE_ENVIO.map(({ valor, etiqueta }) => ({ etiqueta, cantidad: envios ? envios[valor].length : null }));
  });

  constructor() {
    addIcons({
      clipboardOutline,
      downloadOutline,
      logOutOutline,
      qrCodeOutline,
      swapHorizontalOutline,
      timerOutline,
      trashOutline,
    });
  }

  /** Ionic lo llama cada vez que se vuelve a la pantalla principal. */
  ionViewWillEnter(): void {
    void this.cargarEnvios();
  }

  async cargarEnvios(): Promise<void> {
    this.errorEnvios.set(null);
    try {
      this.pedidos.set(await firstValueFrom(this.logistica.pedidos()));
    } catch (error) {
      this.errorEnvios.set(mensajeDeError(error));
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.sesion.cerrar();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
