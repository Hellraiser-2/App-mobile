import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { mockInterceptor } from './app/core/mock/mock.interceptor';
import { authInterceptor } from './app/core/sesion/auth.interceptor';
import { SesionService } from './app/core/sesion/sesion.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, mockInterceptor])),
    // La sesión guardada se recupera antes de la primera navegación, para que los guards la vean.
    provideAppInitializer(() => inject(SesionService).restaurar()),
  ],
});
