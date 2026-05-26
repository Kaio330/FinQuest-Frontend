import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Só injeta o token em pedidos ao próprio backend
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const reqAutenticado = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(reqAutenticado);
};
