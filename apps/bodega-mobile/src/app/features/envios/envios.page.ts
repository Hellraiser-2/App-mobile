import { Component, computed, inject, signal } from '@angular/core';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import type { Pedido } from '@rockstar/contracts';
import { addIcons } from 'ionicons';
import { cubeOutline, locationOutline, timeOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';

import { mensajeDeError } from '../../core/api/errores';
import { valorDeEvento } from '../../shared/formato';
import {
  GRUPOS_DE_ENVIO,
  GrupoDeEnvio,
  agruparEnvios,
  esUrgente,
  etiquetaDeEstado,
  momentoDelPedido,
} from './envios';
import { LogisticaApi } from './logistica.api';

/** Pedidos del e-commerce separados en por enviar, en camino y enviados. */
@Component({
  selector: 'app-envios',
  imports: [
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonContent,
    IonHeader,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/inicio"></ion-back-button>
        </ion-buttons>
        <ion-title>Envíos</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [value]="grupo()" (ionChange)="grupo.set($any(valor($event)))">
          @for (opcion of grupos; track opcion.valor) {
            <ion-segment-button [value]="opcion.valor">
              {{ opcion.etiqueta }} ({{ envios()[opcion.valor].length }})
            </ion-segment-button>
          }
        </ion-segment>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      @if (error(); as mensaje) {
        <div class="rs-acciones">
          <ion-text color="danger">
            <p role="alert">{{ mensaje }}</p>
          </ion-text>
          <ion-button expand="block" [disabled]="cargando()" (click)="cargar()">Reintentar</ion-button>
        </div>
      }
      @for (pedido of visibles(); track pedido.idPedido) {
        <ion-card class="pedido" [class.urgente]="urgente(pedido)">
          <div class="cabecera">
            <span class="numero">Pedido #{{ pedido.idPedido }}</span>
            <span class="estados">
              @if (urgente(pedido)) {
                <ion-badge color="danger">Urgente</ion-badge>
              }
              <ion-badge [color]="colorDe(pedido)">{{ etiquetaDeEstado(pedido.estado) }}</ion-badge>
            </span>
          </div>
          <h2>{{ pedido.destinatario }}</h2>
          <p class="dato">
            <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
            <span>{{ pedido.direccion }}, {{ pedido.comuna }}, {{ pedido.region }}</span>
          </p>
          <ul>
            @for (linea of pedido.lineas; track linea.idVariante) {
              <li>
                <strong>{{ linea.cantidad }}×</strong>
                <span>
                  {{ linea.producto }} · {{ linea.talla }} · {{ linea.color }}
                  <small>{{ linea.sku }}</small>
                </span>
              </li>
            }
          </ul>
          <p class="dato">
            <ion-icon name="time-outline" aria-hidden="true"></ion-icon>
            <span>{{ momento(pedido) }}</span>
          </p>
          @if (pedido.trackingStarken) {
            <p class="dato">
              <ion-icon name="cube-outline" aria-hidden="true"></ion-icon>
              <span>
                Seguimiento Starken
                <span class="rs-codigo">{{ pedido.trackingStarken }}</span>
              </span>
            </p>
          }
        </ion-card>
      } @empty {
        @if (!error()) {
          <p role="status">{{ cargando() ? 'Cargando envíos…' : 'No hay envíos en este estado.' }}</p>
        }
      }
    </ion-content>
  `,
  styles: `
    .pedido {
      padding: 16px;
    }
    .urgente {
      border-color: rgba(255, 92, 92, 0.4);
    }
    .cabecera,
    .estados,
    .dato {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .cabecera {
      justify-content: space-between;
    }
    .numero {
      color: var(--rs-tenue);
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h2 {
      margin: 8px 0 6px;
      font-family: var(--rs-fuente-titulo);
      font-size: 1.45rem;
      font-weight: 600;
      line-height: 1.15;
    }
    .dato {
      align-items: flex-start;
      margin: 6px 0 0;
      color: var(--rs-tenue);
      font-size: 0.88rem;
      line-height: 1.4;
    }
    .dato ion-icon {
      flex: none;
      margin-top: 1px;
      color: var(--ion-color-primary);
      font-size: 17px;
    }
    ul {
      margin: 12px 0;
      padding: 4px 12px;
      border-radius: var(--rs-radio-chico);
      background: var(--rs-superficie-alta);
      list-style: none;
    }
    li {
      display: flex;
      gap: 10px;
      padding: 8px 0;
      font-size: 0.92rem;
      line-height: 1.35;
    }
    li + li {
      border-top: 1px solid var(--rs-borde);
    }
    li strong {
      min-width: 26px;
      color: var(--ion-color-primary);
    }
    small {
      display: block;
      color: var(--rs-tenue);
    }
  `,
})
export class EnviosPage {
  private readonly api = inject(LogisticaApi);

  private readonly pedidos = signal<Pedido[]>([]);
  readonly grupo = signal<GrupoDeEnvio>('POR_ENVIAR');
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly envios = computed(() => agruparEnvios(this.pedidos()));
  readonly visibles = computed(() => this.envios()[this.grupo()]);

  protected readonly grupos = GRUPOS_DE_ENVIO;
  protected readonly etiquetaDeEstado = etiquetaDeEstado;
  protected readonly valor = valorDeEvento;
  protected readonly urgente = (pedido: Pedido) => esUrgente(pedido);
  protected readonly momento = (pedido: Pedido) => momentoDelPedido(pedido);

  constructor() {
    addIcons({ cubeOutline, locationOutline, timeOutline });
  }

  /** Ionic lo llama cada vez que se entra a la pantalla, de modo que los envíos estén al día. */
  ionViewWillEnter(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      this.pedidos.set(await firstValueFrom(this.api.pedidos()));
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  protected colorDe(pedido: Pedido): string {
    switch (pedido.estado) {
      case 'ENTREGADO':
        return 'success';
      case 'DESPACHADO':
        return 'primary';
      case 'ATENCION_MANUAL':
        return 'danger';
      default:
        return 'warning';
    }
  }
}
