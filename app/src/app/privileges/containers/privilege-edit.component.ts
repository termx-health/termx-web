import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Privilege, PrivilegeResource} from 'terminology-lib/privileges';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {PrivilegeService} from '../services/privilege.service';
import {collect, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  templateUrl: './privilege-edit.component.html',
})
export class PrivilegeEditComponent implements OnInit {
  public privilege?: Privilege;
  public resourceMap?: {[type: string]: PrivilegeResource[]} = {};

  public resourceModalData: {
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

  public saveResource(): void {
    if (!validateForm(this.resourceForm)) {
      return;
    }
    const resource = this.resourceModalData.resource!;
    if (isDefined(this.resourceModalData.editKey) && isDefined(this.resourceModalData.editIndex)) {
      this.deleteResource(this.resourceModalData.editKey, this.resourceModalData.editIndex);
    }
    this.resourceMap![resource.resourceType!] = [...(this.resourceMap![resource.resourceType!] || []), resource];
    this.resourceMap = {...this.resourceMap};
    this.fireOnChange();
    this.resourceModalData.visible = false;
  }

  public deleteResource(key: string, index: number): void {
    this.resourceMap![key].splice(index, 1);
    this.resourceMap = {...this.resourceMap};
    if (this.resourceMap[key].length === 0) {
      delete this.resourceMap[key];
    }
    this.fireOnChange();
  }


  public openResourceModal(options: {key?: string, index?: number} = {}): void {
    const {key, index} = options;
    this.resourceModalData = {
      visible: true,
      editKey: key,
      editIndex: index,
      resource: (key && isDefined(index)) ? copyDeep(this.resourceMap![key][index]) : new PrivilegeResource()
    };
  }

  public filter = (resource: {id?: string}) => {
    const resourceType = this.resourceModalData.resource!.resourceType!;
    const resourceIds = (this.resourceMap?.[resourceType] || []).map(r => r.resourceId);
    return !resourceIds.includes(resource.id);
  };

  private fireOnChange(): void {
    this.privilege!.resources = Object.values(this.resourceMap || []).flat();
  }
}
