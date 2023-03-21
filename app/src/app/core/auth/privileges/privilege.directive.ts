import {Directive, Input, OnChanges, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthService} from '../auth.service';

@Directive({
  selector: '[twPrivileged]',
})
export class PrivilegeDirective implements OnChanges {
  @Input() public twPrivileged?: string | Array<string>;

  public constructor(
    private templateRef: TemplateRef<void>,
    private authService: AuthService,
    private vcr: ViewContainerRef,
  ) { }

  public ngOnChanges(): void {
    if (this.hasRequiredPrivileges()) {
      this.vcr.createEmbeddedView(this.templateRef);
    } else {
      this.vcr.clear();
    }
  }

  private hasRequiredPrivileges(): boolean {
    if (!this.twPrivileged) {
      return true;
    }
    return this.authService.hasAnyPrivilege(Array.isArray(this.twPrivileged) ? this.twPrivileged : [this.twPrivileged]);
  }
}
