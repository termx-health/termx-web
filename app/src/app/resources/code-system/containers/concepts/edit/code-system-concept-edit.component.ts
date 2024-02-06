import {Component, OnInit, ViewChild} from '@angular/core';
import {
  CodeSystem,
  CodeSystemConcept,
  CodeSystemEntityVersion,
  CodeSystemVersion,
  CodeSystemVersionReference,
  ConceptUtil,
  EntityProperty
} from 'app/src/app/resources/_lib';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from '../../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {CodeSystemDesignationEditComponent} from './designation/code-system-designation-edit.component';
import {CodeSystemPropertyValueEditComponent} from './propertyvalue/code-system-property-value-edit.component';
import {CodeSystemAssociationEditComponent} from './association/code-system-association-edit.component';
import {forkJoin, of} from 'rxjs';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {Task} from 'term-web/task/_lib';
import {TaskService} from 'term-web/task/services/task-service';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';
import {environment} from 'environments/environment';

@Component({
  templateUrl: './code-system-concept-edit.component.html',
  styles: [`
    .version-sidebar {
      height: min-content;
      margin-bottom: 1rem
    }

    .padded {
      display: block;
      margin-top: 1rem
    }
  `]
})
export class CodeSystemConceptEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public versionCode?: string | null;
  public parent?: string | null;
  public codeSystem?: CodeSystem;
  public codeSystemVersion?: CodeSystemVersion;
  public codeSystemVersions?: CodeSystemVersion[];
  public concept?: CodeSystemConcept;
  public conceptVersion?: CodeSystemEntityVersion;

  protected loader = new LoadingManager();
  public mode: 'add' | 'edit' = 'add';
  protected showOnlyOpenedTasks: boolean = true;

  protected taskModalData: {visible?: boolean, assignee?: string, comment?: string} = {};
  @ViewChild("taskModalForm") public taskModalForm?: NgForm;

  @ViewChild("form") public form?: NgForm;
  @ViewChild("designationEdit") public designationEdit?: CodeSystemDesignationEditComponent;
  @ViewChild("propertyValueEdit") public propertyValueEdit?: CodeSystemPropertyValueEditComponent;
  @ViewChild("associationEdit") public associationEdit?: CodeSystemAssociationEditComponent;
  @ViewChild(ResourceContextComponent) public resourceContextComponent?: ResourceContextComponent;
  @ViewChild(ResourceTasksWidgetComponent) public resourceTasksWidgetComponent?: ResourceTasksWidgetComponent;

  public constructor(
    public codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.versionCode = this.route.snapshot.paramMap.get('versionCode');
    const conceptCode = this.route.snapshot.paramMap.get('conceptCode') ? decodeURIComponent(this.route.snapshot.paramMap.get('conceptCode')) : undefined;
    const conceptVersionId = this.route.snapshot.queryParamMap.get('conceptVersionId');

    this.parent = this.route.snapshot.queryParamMap.get('parent');
    this.mode = conceptCode ? 'edit' : 'add';

    this.loadData();

    if (this.mode === 'edit') {
      this.loader.wrap('init', this.codeSystemService.loadConcept(this.codeSystemId, conceptCode, this.versionCode)).subscribe(c => {
        this.concept = this.writeConcept(c);
        const conceptVersion = this.concept?.versions?.find(v => v.id === Number(conceptVersionId)) ||
          this.concept?.versions?.[this.concept?.versions?.length - 1];
        this.selectVersion(conceptVersion);
      });
    } else {
      this.concept = this.writeConcept(new CodeSystemConcept());
      this.addVersion();
    }
  }

  public save(): void {
    if (!(validateForm(this.form) && (!this.propertyValueEdit || this.propertyValueEdit.valid()))) {
      return;
    }
    const request = {concept: copyDeep(this.concept), entityVersion: copyDeep(this.conceptVersion)};
    request.entityVersion.code = this.concept.code;
    request.entityVersion.designations = this.designationEdit?.getDesignations();
    request.entityVersion.propertyValues = this.propertyValueEdit?.getPropertyValues();
    request.entityVersion.associations = this.associationEdit?.getAssociations();
    this.loader.wrap('save', this.codeSystemService.saveConcept(this.codeSystemId, this.versionCode, request))
      .subscribe(() => this.location.back());
  }

  private loadConcept(conceptCode: string): void {
    this.codeSystemService.loadConcept(this.codeSystemId!, conceptCode).subscribe(c => this.concept = c).add(() => {
      this.selectVersion(this.concept?.versions?.[this.concept?.versions?.length - 1]);
    });
  }

  public get newVersionExists(): boolean {
    return !!this.concept!.versions?.find(v => !v.id);
  }

  public selectVersion(version?: CodeSystemEntityVersion): void {
    version.designations ??= [];
    version.propertyValues ??= [];
    version.associations ??= [];
    this.conceptVersion = version;
  }

  public addVersion(): void {
    const newVersion: CodeSystemEntityVersion = {status: 'draft', associations: [], designations: [], propertyValues: []};
    const parentReq = this.codeSystemId && this.parent ? this.codeSystemService.loadConcept(this.codeSystemId, this.parent) : of(new CodeSystemConcept());
    parentReq.subscribe(parent => {
      if (parent?.id) {
        const designations = ConceptUtil.getLastVersion(parent)?.designations;
        designations?.forEach(d => d.id = undefined);
        const properties = ConceptUtil.getLastVersion(parent)?.propertyValues;
        properties?.forEach(p => p.id = undefined);
        newVersion.designations = designations;
        newVersion.propertyValues = properties;
        newVersion.associations = [{
          associationType: this.codeSystem?.hierarchyMeaning || 'is-a',
          status: 'active',
          targetCode: parent.code,
          targetId: ConceptUtil.getLastVersion(parent)?.id
        }];
      }
      this.concept.versions = [...this.concept.versions || [], newVersion];
      this.selectVersion(newVersion);
    });

  }

  public duplicateVersion(version: CodeSystemEntityVersion): void {
    this.loader.wrap('duplicate', this.codeSystemService.duplicateEntityVersion(this.codeSystemId!, version.id!))
      .subscribe(() => {
        if (isDefined(this.codeSystemVersion)) {
          this.resourceContextComponent.unselectResourceOrVersion();
        } else {
          this.loadConcept(this.concept.code);
        }
      });
  }

  public deleteConcept(code: string): void {
    if (!isDefined(code)) {
      return;
    }
    this.loader.wrap('concept-delete', this.codeSystemService.deleteConcept(code, this.codeSystemId)).subscribe(() => this.location.back());
  }

  public deleteVersion(id: number): void {
    if (!isDefined(id)) {
      this.concept.versions = [...this.concept.versions.filter(v => isDefined(v.id)) || []];
      if (!this.concept.versions.includes(this.conceptVersion)) {
        this.selectVersion(this.concept.versions[this.concept.versions.length - 1]);
      }
    } else {
      this.loader.wrap('version-delete', this.codeSystemService.deleteEntityVersion(this.codeSystemId, id)).subscribe(() => {
        this.loader.wrap('load', this.codeSystemService.loadConcept(this.codeSystemId, this.concept.code))
          .subscribe(c => {
            this.concept = c;
            this.selectVersion(this.concept.versions[this.concept.versions.length - 1]);
          });
      });
    }
  }

  public changeVersionStatus(version: CodeSystemEntityVersion, status: 'draft' | 'active' | 'retired'): void {
    this.loader.wrap('status-change', this.codeSystemService.changeEntityVersionStatus(this.codeSystemId, version.id, status)).subscribe(() => {
      this.conceptVersion.status = status;
      this.loader.wrap('load', this.codeSystemService.loadConcept(this.codeSystemId, this.concept.code))
        .subscribe(c => {
          this.concept = c;
          this.selectVersion(c.versions.find(v => v.id === version.id));
        });
    });
  }

  private writeConcept(c: CodeSystemConcept): CodeSystemConcept {
    c.versions ??= [];
    return c;
  }

  private loadData(): void {
    this.loader.wrap('init', forkJoin([
      this.codeSystemService.load(this.codeSystemId),
      this.versionCode ? this.codeSystemService.loadVersion(this.codeSystemId, this.versionCode) : of(undefined),
      !this.versionCode ? this.codeSystemService.searchVersions(this.codeSystemId, {limit: -1}) : of({data: []})]
    )).subscribe(([cs, version, versions]) => {
      this.codeSystem = cs;
      this.codeSystemVersion = version;
      this.codeSystemVersions = versions.data;
    });
  }

  protected filterProperties = (p: EntityProperty, kind: string): boolean => {
    return p.kind === kind && !['status', 'is-a', 'parent', 'child', 'partOf', 'groupedBy', 'classifiedWith'].includes(p.name);
  };

  public addDesignation(prop: EntityProperty): void {
    this.conceptVersion.designations =
      [...this.designationEdit.designations || [], {designationTypeId: prop.id, designationType: prop.name, status: 'draft', caseSignificance: 'ci'}];
  }

  public addPropertyValue(prop: EntityProperty): void {
    this.conceptVersion.propertyValues =
      [...this.conceptVersion.propertyValues || [], {entityPropertyId: prop.id, entityProperty: prop.name, value: prop.type === 'Coding' ? {} : undefined}];
  }

  public addAssociation(): void {
    this.conceptVersion.associations = [...this.conceptVersion.associations || [], {status: 'active', associationType: this.codeSystem.hierarchyMeaning}];
  }

  protected unlink(entityVersionId: number, codeSystemVersion: string): void {
    this.codeSystemService.unlinkEntityVersions(this.codeSystem.id, codeSystemVersion, [entityVersionId]).subscribe(() => {
      if (codeSystemVersion === this.codeSystemVersion?.version) {
        this.resourceContextComponent.unselectResourceOrVersion();
      } else {
        this.loadData();
      }
    });
  }

  protected link(entityVersionId: number, codeSystemVersion: string): void {
    this.codeSystemService.linkEntityVersions(this.codeSystem.id, codeSystemVersion, [entityVersionId]).subscribe(() => {
      this.resourceContextComponent.selectVersion(codeSystemVersion);
    });
  }

  protected filterDraftVersions = (v: CodeSystemVersion, versions: CodeSystemVersionReference[]): boolean => {
    return v.status === 'draft' && !versions?.find(ver => ver.version === v.version);
  };

  protected openFhir(code: string): void {
    window.open(window.location.origin + environment.baseHref + 'fhir/CodeSystem/' + this.codeSystem.id + '/lookup' + '?_code=' + code, '_blank');
  }

  protected createTask(): void {
    if (!validateForm(this.taskModalForm)) {
      return;
    }

    const task = new Task();
    task.workflow ??= 'concept-review';
    task.assignee = this.taskModalData.assignee;
    task.title = `Review code system "${this.codeSystemId}" concept "${this.concept.code}"`;
    task.context = [
      {type: 'code-system', id: this.codeSystemId},
      this.conceptVersion?.id ? {type: 'concept-version', id: this.conceptVersion.id} : undefined,
      this.codeSystemVersion?.id ? {type: 'code-system-version', id: this.codeSystemVersion.id} : undefined
    ].filter(c => isDefined(c));
    task.content = 'Review the content of the concept [' + this.concept.code + ']'+
      '(concept:' + this.codeSystem.id + '|' + this.concept.code + ').' +
      (this.taskModalData.comment ? '\n' + this.taskModalData.comment : '');
    this.loader.wrap('create-task', this.taskService.save(task)).subscribe(() => {
      this.taskModalData = {};
      this.resourceTasksWidgetComponent.loadTasks();
    });
  }
}
