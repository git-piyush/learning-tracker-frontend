// shared/base.component.ts
import { Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './shared/notificationService';

export abstract class BaseComponent {

  protected route!: ActivatedRoute;
  protected router!: Router;
  protected fb!: FormBuilder;
  protected http!: HttpClient;
  protected notify!:NotificationService;

  constructor(injector: Injector) {
    this.route  = injector.get(ActivatedRoute);
    this.router = injector.get(Router);
    this.fb     = injector.get(FormBuilder);
    this.http   = injector.get(HttpClient);
    this.notify = injector.get(NotificationService);
  }
}
