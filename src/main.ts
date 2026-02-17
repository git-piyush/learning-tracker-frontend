import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loaderInterceptor } from './app/loading-effect/loader.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loaderInterceptor])
    )
  ]
}).catch((err) => console.error(err));



