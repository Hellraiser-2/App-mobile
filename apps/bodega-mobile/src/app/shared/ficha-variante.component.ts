import { Component, input } from '@angular/core';
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular';
import type { VarianteStock } from '@rockstar/contracts';

import { etiquetaUbicacion } from './formato';
import { ImagenPrendaComponent } from './imagen-prenda.component';

/** Datos de una variante con sus existencias por ubicación. */
@Component({
  selector: 'app-ficha-variante',
  imports: [ImagenPrendaComponent, IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle],
  template: `
    <ion-card>
      <div class="encabezado">
        <app-imagen-prenda
          [url]="variante().imagenUrl"
          [alt]="'Foto de ' + variante().producto"
          style="--tamano: 96px"
        ></app-imagen-prenda>
        <ion-card-header>
          <ion-card-subtitle>{{ variante().sku }} · {{ variante().codigo }}</ion-card-subtitle>
          <ion-card-title>{{ variante().producto }}</ion-card-title>
        </ion-card-header>
      </div>
      <ion-card-content>
        <p>
          {{ variante().categoria }}
          @if (variante().banda; as banda) {
            · {{ banda }}
          }
        </p>
        <p>Talla {{ variante().talla }} · {{ variante().color }}</p>
        <p>Ubicación en bodega: {{ variante().codigoUbicacion }}</p>
        <p>
          @if (variante().activo) {
            <ion-badge color="success">Activo</ion-badge>
          } @else {
            <ion-badge color="medium">Desactivado</ion-badge>
          }
        </p>
        <dl class="existencias">
          @for (existencia of variante().existencias; track existencia.ubicacion) {
            <div>
              <dt>{{ etiqueta(existencia.ubicacion) }}</dt>
              <dd>{{ existencia.cantidad }}</dd>
            </div>
          }
          <div>
            <dt>Reservado</dt>
            <dd>{{ variante().reservado }}</dd>
          </div>
          <div>
            <dt>Disponible</dt>
            <dd>{{ variante().disponible }}</dd>
          </div>
        </dl>
      </ion-card-content>
    </ion-card>
  `,
  styles: `
    .encabezado {
      display: flex;
      align-items: center;
      padding-inline-start: 16px;
    }
    .existencias {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 12px 0 0;
    }
    dt {
      font-size: 0.8rem;
      opacity: 0.7;
    }
    dd {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
    }
  `,
})
export class FichaVarianteComponent {
  readonly variante = input.required<VarianteStock>();

  protected readonly etiqueta = etiquetaUbicacion;
}
