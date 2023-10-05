import {Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {Space} from '../model/space';
import {Package, PackageVersion} from '../model/package';
import {PackageLibService, SpaceLibService} from 'term-web/space/_lib';

export class SpaceItem {
  public space: Space;
  public package: Package;
  public version: PackageVersion;
}

@Component({
  selector: 'tw-space-drawer-search',
  templateUrl: 'space-drawer-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SpaceDrawerSearchComponent), multi: true}]
})
export class SpaceDrawerSearchComponent implements ControlValueAccessor, OnChanges {
  @Input() public space: Space;
  @Input() public package: Package;
  @Input() public version: PackageVersion;
  @Input() @BooleanInput() public allowClear: string | boolean = true;
  @Input() @BooleanInput() public disabled: string | boolean;
  @Output() public twChange = new EventEmitter<SpaceItem>();

  public loading: boolean = false;
  public packages: Package[];
  public packageVersions: PackageVersion[];

  protected drawerOpened: boolean;

  public val: SpaceItem = new SpaceItem(); // val
  private onChange = (x: any) => x;
  private onTouched = (): void => undefined;

  public constructor(
    private spaceLibService: SpaceLibService,
    private packageService: PackageLibService,
    private translateService: TranslateService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['space']) {
      this.val = this.val || new SpaceItem();
      this.val.space = this.space;
      this.loadPackages(this.space?.id);
    }
    if (changes['package']) {
      this.val = this.val || new SpaceItem();
      this.val.package = this.package;
      this.loadVersions(this.space?.id, this.package?.id);
    }
    if (changes['version']) {
      this.val = this.val || new SpaceItem();
      this.val.version = this.version;
    }
  }

  public writeValue(obj: SpaceItem): void {
    if (!obj) {
      this.val = new SpaceItem();
      return;
    }
    const p = obj as SpaceItem;
    this.val = p || new SpaceItem();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private fireOnChange(): void {
    this.twChange.emit(this.val);
    this.onChange(this.val);
  }

  protected onSelect(p: SpaceItem): void {
    this.val = p;
    this.fireOnChange();
    this.closeDrawer();
  }

  public openDrawer(): void {
    if (this.disabled) {
      return;
    }
    this.drawerOpened = true;
  }

  public closeDrawer(): void {
    this.drawerOpened = false;
  }

  public get valueDefined(): boolean {
    return !!(this.val?.space?.id || this.val?.version?.id || this.val?.package?.id);
  }

  public valueDisplay = (val: SpaceItem): string => {
    const lang = this.translateService.currentLang;
    return (this.val.space?.names?.[lang] || val.space?.code);
  };

  public loadPackages(spaceId: number): void {
    if (!spaceId) {
      return;
    }
    this.spaceLibService.loadPackages(spaceId).subscribe(packages => this.packages = packages);
  }

  public loadVersions(spaceId: number, packageId: number): void {
    if (!packageId || !spaceId) {
      return;
    }
    this.packageService.loadVersions(spaceId, packageId).subscribe(versions => this.packageVersions = versions);
  }
}
