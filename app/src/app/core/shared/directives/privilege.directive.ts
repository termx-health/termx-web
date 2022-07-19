import {Directive, Input, OnChanges, TemplateRef, ViewContainerRef} from '@angular/core';
import {Observable, of} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';

@Directive({
  selector: '[twaPrivileged]'
})
export class PrivilegeDirective implements OnChanges {

  @Input() public twaPrivileged: string | Array<string>;

  public constructor(
    private templateRef: TemplateRef<void>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService) {
  }

  public ngOnChanges(): void {
    this.hasRequiredPrivileges().subscribe(hasPrivileges => {
      if (hasPrivileges) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

  private hasRequiredPrivileges(): Observable<boolean> {
    if (Array.isArray(this.twaPrivileged)) {
      return this.authService.hasAnyPrivilege(this.twaPrivileged);
    }
    return this.twaPrivileged ? this.authService.hasPrivilege(this.twaPrivileged) : of(true);
  }
}
