import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {collect, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {Privilege, PrivilegeResource, PrivilegeResourceActions} from 'term-web/privileges/_lib';
import {PrivilegeService} from '../services/privilege.service';

@Component({
  templateUrl: './privilege-edit.component.html',
})
export class PrivilegeEditComponent implements OnInit {
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

  public constructor(
    private privilegeService: PrivilegeService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

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
    let resource = (key && isDefined(index)) ? copyDeep(this.resourceMap![key][index]) : new PrivilegeResource();
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
