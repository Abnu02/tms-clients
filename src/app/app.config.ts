import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';

import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { errorInterceptors } from './interceptors/error.interceptor';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([credentialsInterceptor, errorInterceptors, jwtInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding())
  ]
};
