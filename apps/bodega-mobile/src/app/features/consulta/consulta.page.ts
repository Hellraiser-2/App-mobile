import { Component, signal } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import type { VarianteStock } from '@rockstar/contracts';

import { FichaVarianteComponent } from '../../shared/ficha-variante.component';
import { BuscadorVarianteComponent } from '../escaner/buscador-variante.component';

@Component({
  selector: 'app-consulta',
  imports: [
    BuscadorVarianteComponent,
    FichaVarianteComponent,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/inicio"></ion-back-button>
        </ion-buttons>
        <ion-title>Consultar producto</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <app-buscador-variante (seleccionada)="variante.set($event)"></app-buscador-variante>
      @if (variante(); as seleccionada) {
        <app-ficha-variante [variante]="seleccionada"></app-ficha-variante>
      }
    </ion-content>
  `,
})
export class ConsultaPage {
  readonly variante = signal<VarianteStock | null>(null);
}
