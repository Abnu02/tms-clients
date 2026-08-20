import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core/primitives/di';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
export const errorInterceptors: HttpInterceptorFn = (req, next) => {
    const route = inject(Router);
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const detailMessage = error.error?.detail ?? "A system error occurred. Please try again later.";

            if (error.status === 401) {
                route.navigate(['/login']);
            }
            else { console.error('API Error Response:', detailMessage); }
            return throwError(() => error);
        }))
}