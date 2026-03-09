import { Pipe, PipeTransform, inject } from '@angular/core';
import {AuthService} from 'term-web/core/auth/auth.service';

@Pipe({ name: 'twHasAnyPrivilege' })
export class HasAnyPrivilegePipe implements PipeTransform {
  private authService = inject(AuthService);


  public transform(privileges: string[] | string): boolean {
    return this.authService.hasAnyPrivilege(Array.isArray(privileges) ? privileges : [privileges]);
  }
}
