import {Component, Inject} from '@angular/core';
import {AuthLibService} from 'terminology-lib/auth/auth/services/auth-lib.service';
import {TERMINOLOGY_API} from 'terminology-lib/terminology-lib.token';

@Component({
  templateUrl: 'terminology-service-api.component.html',
})
export class TerminologyServiceApiComponent {

  public constructor(private authLibService: AuthLibService, @Inject(TERMINOLOGY_API) private api: string) {}

  public openTerminologyApi(): void {
    this.authLibService.setCookie().subscribe(() => {
      window.open(`${this.api}/swagger-ui`, '_blank');
    });
  }
}
