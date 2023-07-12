import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput, group, LoadingManager} from '@kodality-web/core-util';
import {User} from '../model/user';
import {UserLibService} from '../services/user-lib.service';


@Component({
  selector: 'tw-user-select',
  templateUrl: './user-select.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UserSelectComponent), multi: true}]
})
export class UserSelectComponent implements OnInit, ControlValueAccessor {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = true;
  @Input() public placeholder: string = 'marina.ui.inputs.search.placeholder';
  @Input() public idNe?: number;

  public data: {[id: string]: User} = {};
  public value?: string;
  protected loader = new LoadingManager();

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(private userService: UserLibService) {}

  public ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loader.wrap('load', this.userService.loadAll()).subscribe(users => this.data = group(users, u => u.sub));
  }

  public writeValue(obj: User | string): void {
    this.value = typeof obj === 'object' ? obj?.sub : obj;
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      this.onChange(this.data?.[String(this.value!)]);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
