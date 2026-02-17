import { HttpInterceptorFn } from '@angular/common/http';
import { loaderService } from './loader.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(loaderService);
  loader.show();

  return next(req).pipe(
    finalize(() => loader.hide())
  );
};
