import {Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BooleanInput} from '@kodality-web/core-util';
import {Project} from '../model/project';
import {Package, PackageVersion} from '../model/package';
import {ProjectLibService} from '../services/project-lib-service';
import {PackageLibService} from '../services/package-lib-service';
import {TranslateService} from '@ngx-translate/core';

export class ProjectItem {
  public project: Project;
  public package: Package;
  public version: PackageVersion;
}

@Component({
  selector: 'tw-project-drawer-search',
  templateUrl: 'project-drawer-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProjectDrawerSearchComponent), multi: true}]
})
export class ProjectDrawerSearchComponent implements ControlValueAccessor, OnChanges {
  @Input() public project: Project;
  @Input() public package: Package;
  @Input() public version: PackageVersion;
  @Input() @BooleanInput() public allowClear: string | boolean = true;
  @Input() @BooleanInput() public disabled: string | boolean;
  @Output() public twChange = new EventEmitter<ProjectItem>();

  public loading: boolean = false;
  public packages: Package[];
  public packageVersions: PackageVersion[];

  protected drawerOpened: boolean;

  public val: ProjectItem = new ProjectItem(); // val
  private onChange = (x: any) => x;
  private onTouched = (): void => undefined;

  public constructor(
    private projectService: ProjectLibService,
    private packageService: PackageLibService,
    private translateService: TranslateService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['project']) {
      this.val = this.val || new ProjectItem();
      this.val.project = this.project;
      this.loadPackages(this.project?.id);
    }
    if (changes['package']) {
      this.val = this.val || new ProjectItem();
      this.val.package = this.package;
      this.loadVersions(this.package?.id);
    }
    if (changes['version']) {
      this.val = this.val || new ProjectItem();
      this.val.version = this.version;
    }
  }

  public writeValue(obj: ProjectItem): void {
    if (!obj) {
      this.val = new ProjectItem();
      return;
    }
    const p = obj as ProjectItem;
    this.val = p || new ProjectItem();
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

  protected onSelect(p: ProjectItem): void {
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
    return !!(this.val?.project?.id || this.val?.version?.id || this.val?.package?.id);
  }

  public valueDisplay = (val: ProjectItem): string => {
    const lang = this.translateService.currentLang;
    return (this.val.project?.names?.[lang] || val.project?.code);
  };

  public loadPackages(projectId: number): void {
    if (!projectId) {
      return;
    }
    this.projectService.loadPackages(projectId).subscribe(packages => this.packages = packages);
  }

  public loadVersions(packageId: number): void {
    if (!packageId) {
      return;
    }
    this.packageService.loadVersions(packageId).subscribe(versions => this.packageVersions = versions);
  }
}
