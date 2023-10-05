import {Directive, Input, OnInit, Optional, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthService} from '../auth.service';
import {PrivilegeContextDirective} from './privilege-context.directive';
import {PrivilegedPipe} from 'term-web/core/auth/privileges/privileged.pipe';

@Directive({
  selector: '[twPrivileged]',
})
export class PrivilegedDirective implements OnInit {
  @Input() public twPrivileged?: string | string[];

  public constructor(
    private templateRef: TemplateRef<void>,
    private authService: AuthService,
    private vcr: ViewContainerRef,
    @Optional() private ctx?: PrivilegeContextDirective
  ) { }

  public ngOnInit(): void {
    if (this.authService.hasAnyPrivilege(PrivilegedPipe.getPrivileges(this.twPrivileged, this.ctx))) {
      this.vcr.createEmbeddedView(this.templateRef);
    } else {
      this.vcr.clear();
    }
  }
}
