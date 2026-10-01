import { Component, computed, inject, signal } from '@angular/core';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import type { Pedido } from '@rockstar/contracts';
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
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
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
        <div class="ion-padding">
          <ion-text color="danger">
            <p role="alert">{{ mensaje }}</p>
          </ion-text>
          <ion-button expand="block" [disabled]="cargando()" (click)="cargar()">Reintentar</ion-button>
        </div>
      }
      @for (pedido of visibles(); track pedido.idPedido) {
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>
              Pedido #{{ pedido.idPedido }}
              <ion-badge [color]="colorDe(pedido)">{{ etiquetaDeEstado(pedido.estado) }}</ion-badge>
              @if (urgente(pedido)) {
                <ion-badge color="danger">Urgente</ion-badge>
              }
            </ion-card-subtitle>
            <ion-card-title>{{ pedido.destinatario }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>{{ pedido.direccion }}, {{ pedido.comuna }}, {{ pedido.region }}</p>
            <ul>
              @for (linea of pedido.lineas; track linea.idVariante) {
                <li>{{ linea.cantidad }} × {{ linea.producto }} · {{ linea.talla }} · {{ linea.color }} ({{ linea.sku }})</li>
              }
            </ul>
            <p>{{ momento(pedido) }}</p>
            @if (pedido.trackingStarken) {
              <p>Seguimiento Starken: {{ pedido.trackingStarken }}</p>
            }
          </ion-card-content>
        </ion-card>
      } @empty {
        @if (!error()) {
          <p class="ion-padding" role="status">{{ cargando() ? 'Cargando envíos…' : 'No hay envíos en este estado.' }}</p>
        }
      }
    </ion-content>
  `,
  styles: `
    ion-badge {
      margin-inline-start: 6px;
      vertical-align: middle;
    }
    ul {
      margin: 8px 0;
      padding-inline-start: 20px;
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
