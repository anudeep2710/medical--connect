import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routing.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpTokenInterceptor } from './app/core/interceptors/http-token.interceptor.function';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpTokenInterceptor]))
  ]
}).catch(err => console.error(err));