import { Component, input } from '@angular/core';
import { IonBadge, IonCard, IonIcon } from '@ionic/angular';
import type { VarianteStock } from '@rockstar/contracts';
import { addIcons } from 'ionicons';
import { locationOutline } from 'ionicons/icons';

import { etiquetaUbicacion } from './formato';
import { ImagenPrendaComponent } from './imagen-prenda.component';

/** Datos de una variante con sus existencias por ubicación. */
@Component({
  selector: 'app-ficha-variante',
  imports: [ImagenPrendaComponent, IonBadge, IonCard, IonIcon],
  template: `
    <ion-card>
      <div class="encabezado">
        <app-imagen-prenda
          [url]="variante().imagenUrl"
          [alt]="'Foto de ' + variante().producto"
          style="--tamano: 92px"
        ></app-imagen-prenda>
        <div>
          <p class="sku">{{ variante().sku }} · {{ variante().codigo }}</p>
          <h2>{{ variante().producto }}</h2>
          <div class="rs-chips">
            <span class="rs-chip">{{ variante().categoria }}</span>
            @if (variante().banda; as banda) {
              <span class="rs-chip">{{ banda }}</span>
            }
            <span class="rs-chip">Talla {{ variante().talla }}</span>
            <span class="rs-chip">{{ variante().color }}</span>
          </div>
        </div>
      </div>
      <div class="ubicacion">
        <span>
          <ion-icon name="location-outline" aria-hidden="true"></ion-icon>
          Ubicación en bodega
          <strong class="rs-codigo">{{ variante().codigoUbicacion }}</strong>
        </span>
        @if (variante().activo) {
          <ion-badge color="success">Activo</ion-badge>
        } @else {
          <ion-badge color="medium">Desactivado</ion-badge>
        }
      </div>
      <dl class="rs-datos">
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
        <div class="rs-destacado">
          <dt>Disponible</dt>
          <dd>{{ variante().disponible }}</dd>
        </div>
      </dl>
    </ion-card>
  `,
  styles: `
    ion-card {
      padding: 16px;
    }
    .encabezado {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .sku {
      margin: 0;
      color: var(--rs-tenue);
      font-size: 0.78rem;
      letter-spacing: 0.04em;
    }
    h2 {
      margin: 2px 0 8px;
      font-family: var(--rs-fuente-titulo);
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1.15;
    }
    .ubicacion {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin: 14px 0;
      color: var(--rs-tenue);
      font-size: 0.85rem;
    }
    .ubicacion span {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .ubicacion ion-icon {
      color: var(--ion-color-primary);
      font-size: 18px;
    }
  `,
})
export class FichaVarianteComponent {
  readonly variante = input.required<VarianteStock>();

  protected readonly etiqueta = etiquetaUbicacion;

  constructor() {
    addIcons({ locationOutline });
  }
}
