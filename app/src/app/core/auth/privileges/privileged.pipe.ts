import {Optional, Pipe, PipeTransform} from '@angular/core';
import {AuthService} from '../auth.service';
import {PrivilegeContextDirective} from './privilege-context.directive';

@Pipe({name: 'twPrivileged'})
export class PrivilegedPipe implements PipeTransform {
  public constructor(private authService: AuthService, @Optional() private ctx?: PrivilegeContextDirective) {}

  public transform(privileges: string[] | string): boolean {
    return this.authService.hasAnyPrivilege(PrivilegedPipe.getPrivileges(privileges, this.ctx));
  }

  public static getPrivileges(privileges: string[] | string, ctx?: PrivilegeContextDirective): string[] {
    let val = !privileges ? [] : Array.isArray(privileges) ? privileges : [privileges];
    val = val.length ? val : ['edit'];
    return val.map(v => {
      if (v.includes('.')) {
        return v;
      }
      if (!ctx) {
        throw Error('context privileges can only be used within twPrivilegeContext directive');
      }
      return ctx.privilegeContext + '.' + v;
    });
  }
}

