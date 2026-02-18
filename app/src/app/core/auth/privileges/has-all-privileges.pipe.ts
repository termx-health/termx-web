import { Pipe, PipeTransform, inject } from '@angular/core';
import {AuthService} from 'term-web/core/auth/auth.service';

@Pipe({ name: 'twHasAllPrivileges' })
export class HasAllPrivilegesPipe implements PipeTransform {
  private authService = inject(AuthService);


  public transform(privileges: string[] | string): boolean {
    return this.authService.hasAllPrivileges(Array.isArray(privileges) ? privileges : [privileges]);
  }
}
