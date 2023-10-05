import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[twPrivilegeContext]'
})
export class PrivilegeContextDirective {
  public privilegeContext: string;

  @Input()
  public set twPrivilegeContext(value: string | any[]) {
    this.privilegeContext = Array.isArray(value) ? value.join('.') : value;
  }
}
