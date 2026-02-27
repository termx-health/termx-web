import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { collect, copyDeep, isDefined, validateForm, ApplyPipe, KeysPipe } from '@kodality-web/core-util';
import {Privilege, PrivilegeResource, PrivilegeResourceActions} from 'term-web/privileges/_lib';
import {PrivilegeService} from 'term-web/privileges/services/privilege.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiButtonModule, MuiPopconfirmModule, MuiIconModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiTableModule, MuiCoreModule, MuiAbbreviateModule, MuiDropdownModule, MuiNoDataModule, MuiModalModule, MuiSelectModule, MuiCheckboxModule } from '@kodality-web/marina-ui';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { MapSetSearchComponent } from 'term-web/resources/_lib/map-set/containers/map-set-search.component';
import { NamingSystemSearchComponent } from 'term-web/resources/_lib/naming-system/containers/naming-system-search.component';
import { AssociationTypeSearchComponent } from 'term-web/resources/_lib/association/containers/association-type-search.component';
import { SpaceSelectComponent } from 'term-web/sys/_lib/space/containers/space-select.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './privilege-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    MuiButtonModule,
    MuiPopconfirmModule,
    MuiIconModule,
    FormsModule,
    MuiTextareaModule,
    MuiMultiLanguageInputModule,
    AddButtonComponent,
    MuiTableModule,
    MuiCoreModule,
    MuiAbbreviateModule,
    MuiDropdownModule,
    MuiNoDataModule,
    MuiModalModule,
    MuiSelectModule,
    CodeSystemSearchComponent,
    ValueSetSearchComponent,
    MapSetSearchComponent,
    NamingSystemSearchComponent,
    AssociationTypeSearchComponent,
    SpaceSelectComponent,
    MuiCheckboxModule,
    TranslatePipe,
    ApplyPipe,
    KeysPipe
],
})
export class PrivilegeEditComponent implements OnInit {
  private privilegeService = inject(PrivilegeService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  public privilege?: Privilege;
  public resourceMap?: {[type: string]: PrivilegeResource[]} = {};

  public modalData: {
    resource?: PrivilegeResource;
    visible?: boolean;
    editKey?: string;
    editIndex?: number
  } = {};

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild("resourceForm") public resourceForm?: NgForm;

  public ngOnInit(): void {
    const privilegeId = this.route.snapshot.paramMap.get('id');
    this.mode = privilegeId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadPrivilege(Number(privilegeId));
    } else {
      this.privilege = new Privilege();
    }
  }

  private loadPrivilege(privilegeId: number): void {
    this.loading = true;
    this.privilegeService.load(privilegeId).subscribe(c => {
      this.privilege = c;
      this.resourceMap = collect(this.privilege?.resources || [], p => p.resourceType!);
    }).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.privilegeService.save(this.privilege!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }

  public deletePrivilege(id: number): void {
    this.loading = true;
    this.privilegeService.delete(id).subscribe(() => this.location.back()).add(() => this.loading = false);
  }


  public confirmResource(): void {
    if (!validateForm(this.resourceForm)) {
      return;
    }
    const resource = this.modalData.resource!;
    if (isDefined(this.modalData.editKey) && isDefined(this.modalData.editIndex)) {
      this.removeResource(this.modalData.editKey, this.modalData.editIndex);
    }
    this.resourceMap![resource.resourceType!] = [...(this.resourceMap![resource.resourceType!] || []), resource];
    this.resourceMap = {...this.resourceMap};
    this.fireOnChange();
    this.modalData.visible = false;
  }

  public removeResource(key: string, index: number): void {
    this.resourceMap![key].splice(index, 1);
    this.resourceMap = {...this.resourceMap};
    if (this.resourceMap[key].length === 0) {
      delete this.resourceMap[key];
    }
    this.fireOnChange();
  }

  private fireOnChange(): void {
    this.privilege!.resources = Object.values(this.resourceMap || []).flat();
  }


  public openResourceModal(options: {key?: string, index?: number} = {}): void {
    const {key, index} = options;
    const resource = (key && isDefined(index)) ? copyDeep(this.resourceMap![key][index]) : new PrivilegeResource();
    if (!resource.actions) {
      resource.actions = new PrivilegeResourceActions();
    }
    this.modalData = {
      visible: true,
      editKey: key,
      editIndex: index,
      resource: resource
    };
  }

  public filter = (resource: {id?: string}): boolean => {
    const resourceType = this.modalData.resource!.resourceType!;
    const resourceIds = (this.resourceMap?.[resourceType] || []).map(r => r.resourceId);
    return !resourceIds.includes(resource.id);
  };

  public filterId = (resource: {id?: number}): boolean => {
    const resourceType = this.modalData.resource!.resourceType!;
    const resourceIds = (this.resourceMap?.[resourceType] || []).map(r => r.resourceId);
    return !resourceIds.includes(String(resource.id));
  };

  public filterCode = (resource: {code?: string}): boolean => {
    const resourceType = this.modalData.resource!.resourceType!;
    const resourceCodes = (this.resourceMap?.[resourceType] || []).map(r => r.resourceId);
    return !resourceCodes.includes(resource.code);
  };

  public asNumber(val: string): number {
    return val ? Number(val) : undefined;
  };
}
