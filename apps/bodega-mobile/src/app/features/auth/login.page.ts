import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonText, IonTitle, IonToolbar } from '@ionic/angular';

import { mensajeDeError } from '../../core/api/errores';
import { SesionService } from '../../core/sesion/sesion.service';
import { valorDeEvento } from '../../shared/formato';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  imports: [IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonText, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Rockstar Bodega</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      @if (sesion.aviso(); as aviso) {
        <ion-text color="warning">
          <p role="status">{{ aviso }}</p>
        </ion-text>
      }
      <form (submit)="$event.preventDefault(); ingresar()">
        <ion-list>
          <ion-item>
            <ion-input
              label="Correo"
              labelPlacement="stacked"
              type="email"
              autocomplete="username"
              [value]="email()"
              [errorText]="errorEmail() ?? ''"
              [class.ion-invalid]="errorEmail() !== null"
              [class.ion-touched]="errorEmail() !== null"
              (ionInput)="email.set(valor($event))"
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Contraseña"
              labelPlacement="stacked"
              type="password"
              autocomplete="current-password"
              [value]="password()"
              [errorText]="errorPassword() ?? ''"
              [class.ion-invalid]="errorPassword() !== null"
              [class.ion-touched]="errorPassword() !== null"
              (ionInput)="password.set(valor($event))"
            ></ion-input>
          </ion-item>
        </ion-list>
        @if (error(); as mensaje) {
          <ion-text color="danger">
            <p role="alert">{{ mensaje }}</p>
          </ion-text>
        }
        <ion-button type="submit" expand="block" [disabled]="enviando()">
          {{ enviando() ? 'Ingresando…' : 'Iniciar sesión' }}
        </ion-button>
      </form>
    </ion-content>
  `,
})
export class LoginPage {
  protected readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly errorEmail = signal<string | null>(null);
  readonly errorPassword = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly enviando = signal(false);

  protected readonly valor = valorDeEvento;

  async ingresar(): Promise<void> {
    if (this.enviando() || !this.validar()) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    try {
      await this.sesion.iniciar(this.email().trim(), this.password());
      this.password.set('');
      await this.router.navigateByUrl('/inicio', { replaceUrl: true });
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }

  private validar(): boolean {
    this.errorEmail.set(FORMATO_EMAIL.test(this.email().trim()) ? null : 'Ingresa un correo válido.');
    this.errorPassword.set(this.password() === '' ? 'Ingresa tu contraseña.' : null);
    return this.errorEmail() === null && this.errorPassword() === null;
  }
}
