import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import {PrivilegedPipe} from 'term-web/core/auth/privileges/privileged.pipe';
import {AuthService} from 'term-web/core/auth/auth.service';
import {PrivilegeContextDirective} from 'term-web/core/auth/privileges/privilege-context.directive';

@Directive({ selector: '[twPrivileged]', })
export class PrivilegedDirective implements OnInit {
  private templateRef = inject<TemplateRef<void>>(TemplateRef);
  private authService = inject(AuthService);
  private vcr = inject(ViewContainerRef);
  private ctx = inject(PrivilegeContextDirective, { optional: true });

  @Input() public twPrivileged?: string | string[];

  public ngOnInit(): void {
    if (this.authService.hasAnyPrivilege(PrivilegedPipe.getPrivileges(this.twPrivileged, this.ctx))) {
      this.vcr.createEmbeddedView(this.templateRef);
    } else {
      this.vcr.clear();
    }
  }
}
