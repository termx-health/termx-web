import {Pipe, PipeTransform} from '@angular/core';
import {AuthService} from '../auth.service';

@Pipe({name: 'twHasAllPrivileges'})
export class HasAllPrivilegesPipe implements PipeTransform {
  public constructor(private authService: AuthService) {}

  public transform(privileges: string[] | string): boolean {
    return this.authService.hasAllPrivileges(Array.isArray(privileges) ? privileges : [privileges]);
  }
}
