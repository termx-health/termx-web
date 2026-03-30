import { Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { BooleanInput, ApplyPipe } from '@termx-health/core-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {PackageLibService} from 'term-web/sys/_lib/space/services/package-lib-service';
import {SpaceLibService} from 'term-web/sys/_lib/space/services/space-lib-service';
import {Package, PackageVersion} from 'term-web/sys/_lib/space/model/package';
import {Space} from 'term-web/sys/_lib/space/model/space';
import { MuiCoreModule, MuiDrawerModule, MuiCardModule, MuiSpinnerModule, MuiFormModule, MuiSelectModule, MuiButtonModule } from '@termx-health/ui';

import { SpaceSelectComponent } from 'term-web/sys/_lib/space/containers/space-select.component';

export class SpaceItem {
  public space: Space;
  public package: Package;
  public version: PackageVersion;
}

@Component({
    selector: 'tw-space-drawer-search',
    templateUrl: 'space-drawer-search.component.html',
    standalone: true,
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SpaceDrawerSearchComponent), multi: true }],
    imports: [MuiCoreModule, MuiDrawerModule, MuiCardModule, MuiSpinnerModule, FormsModule, MuiFormModule, SpaceSelectComponent, MuiSelectModule, MuiButtonModule, ApplyPipe, TranslatePipe]
})
export class SpaceDrawerSearchComponent implements ControlValueAccessor, OnChanges {
  private spaceLibService = inject(SpaceLibService);
  private packageService = inject(PackageLibService);
  private translateService = inject(TranslateService);

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
  private onChange = (x: any): any => x;
  private onTouched = (): void => undefined;

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
