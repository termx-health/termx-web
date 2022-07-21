import {Pipe, PipeTransform} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';

@Pipe({name: 'twaHasAnyPrivilege'})
export class HasAnyPrivilegePipe implements PipeTransform {

  public constructor(
    private authService: AuthService
  ) {}

  public transform(privileges: string[] | string): Observable<boolean> {
    if (typeof privileges === 'string') {
      privileges = [privileges];
    }
    return this.authService.hasAnyPrivilege(privileges);
  }
}
