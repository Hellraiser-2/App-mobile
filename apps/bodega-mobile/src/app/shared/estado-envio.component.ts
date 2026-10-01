import { Component, input, output } from '@angular/core';
import { IonButton, IonText } from '@ionic/angular';

import { EnvioIdempotente } from '../core/api/envio-idempotente';

/** Muestra el error del último envío y, si quedó sin confirmar, permite reintentarlo. */
@Component({
  selector: 'app-estado-envio',
  imports: [IonButton, IonText],
  template: `
    @if (envio().error(); as error) {
      <div class="estado" role="alert">
        <ion-text color="danger">
          <p>{{ error }}</p>
        </ion-text>
        @if (envio().reintentable()) {
          <p class="nota">Los datos se conservaron. Reintentar no duplica la operación.</p>
          <ion-button expand="block" [disabled]="envio().enviando()" (click)="reintentar.emit()">
            Reintentar
          </ion-button>
          <ion-button expand="block" fill="clear" [disabled]="envio().enviando()" (click)="envio().reiniciar()">
            Modificar los datos
          </ion-button>
        }
      </div>
    }
  `,
  styles: `
    .estado {
      padding: 0 16px;
    }
    .nota {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  `,
})
export class EstadoEnvioComponent {
  readonly envio = input.required<EnvioIdempotente>();
  readonly reintentar = output<void>();
}
