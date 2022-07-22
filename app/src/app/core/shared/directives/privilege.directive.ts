import {Directive, Input, OnChanges, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';

@Directive({
  selector: '[twaPrivileged]'
})
export class PrivilegeDirective implements OnChanges {
  @Input() public twaPrivileged?: string | Array<string>;

  public constructor(
    private templateRef: TemplateRef<void>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService) {
  }

  public ngOnChanges(): void {
    if (this.hasRequiredPrivileges()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private hasRequiredPrivileges(): boolean {
    if (!this.twaPrivileged) {
      return true;
    }
    return this.authService.hasAnyPrivilege(Array.isArray(this.twaPrivileged) ? this.twaPrivileged : [this.twaPrivileged]);
  }
}
