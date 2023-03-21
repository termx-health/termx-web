import {Pipe, PipeTransform} from '@angular/core';
import {AuthService} from '../auth.service';

@Pipe({name: 'twHasAnyPrivilege'})
export class HasAnyPrivilegePipe implements PipeTransform {
  public constructor(private authService: AuthService) {}

  public transform(privileges: string[] | string): boolean {
    return this.authService.hasAnyPrivilege(Array.isArray(privileges) ? privileges : [privileges]);
  }
}
