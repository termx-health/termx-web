import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ValueSet, ValueSetVersion} from 'app/src/app/resources/_lib';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {FhirValueSetLibService, SEPARATOR} from 'app/src/app/fhir/_lib';
import {ChefService} from 'app/src/app/integration/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {environment} from 'app/src/environments/environment';
import {Provenance} from 'term-web/sys/_lib';
import {NgForm} from '@angular/forms';
import {compareDates, LoadingManager, validateForm} from '@kodality-web/core-util';
import {Task} from 'term-web/task/_lib';
import {TaskService} from 'term-web/task/services/task-service';
import {Space, SpaceLibService} from 'term-web/space/_lib';

@Component({
  selector: 'tw-value-set-version-info-widget',
  templateUrl: 'value-set-version-info-widget.component.html'
})
export class ValueSetVersionInfoWidgetComponent implements OnChanges {
  protected SEPARATOR = SEPARATOR;
  @Input() public valueSet: ValueSet;
  @Input() public version: ValueSetVersion;
  @Output() public taskCreated: EventEmitter<void> = new EventEmitter();

  protected taskModalData: {visible?: boolean, assignee?: string, type?: 'review' | 'approval'} = {};
  protected provenances: Provenance[];
  protected githubSpaces: Space[];
  @ViewChild("taskModalForm") public taskModalForm?: NgForm;

  protected loader = new LoadingManager();

  public constructor(
    private valueSetService: ValueSetService,
    private fhirValueSetService: FhirValueSetLibService,
    private taskService: TaskService,
    private chefService: ChefService,
    private notificationService: MuiNotificationService,
    private spaceService: SpaceLibService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['version'] && this.version) {
      this.loader.wrap('provenance', this.valueSetService.loadProvenances(this.version.valueSet, this.version.version))
        .subscribe(resp => this.provenances = resp);
      this.spaceService.search({resource: 'value-set|' + this.version.valueSet}).subscribe(r => {
        this.githubSpaces = r.data.filter(s => !!s.integration?.github?.repo
          && (Object.keys(s.integration.github.dirs || {}).some(d => ['valueset-fhir-json', 'valueset-fhir-fsh'].includes(d)))
        );
      });
    }
  }

  protected downloadDefinition(format: string): void {
    this.fhirValueSetService.loadValueSet(this.version.valueSet, this.version.version).subscribe(fhirVs => {
      this.saveFile(fhirVs, format);
    });
  }

  protected downloadExpansion(format: string): void {
    this.fhirValueSetService.expandValueSet(this.version.valueSet, {valueSetVersion: this.version.version}).subscribe(fhirVs => {
      this.saveFile(fhirVs, format);
    });
  }

  private saveFile(fhirVs: any, format: string): void {
    const json = JSON.stringify(fhirVs, null, 2);

    if (format === 'json') {
      saveAs(new Blob([json], {type: 'application/json'}), `${fhirVs.id}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([xml], {type: 'application/xml'}), `${fhirVs.id}.xml`);
    }
    if (format === 'fsh') {
      this.chefService.fhirToFsh({fhir: [json]}).subscribe(r => {
        r.warnings?.forEach(w => this.notificationService.warning('JSON to FSH conversion warning', w.message!, {duration: 0, closable: true}));
        r.errors?.forEach(e => this.notificationService.error('JSON to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
        const fsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        saveAs(new Blob([fsh], {type: 'application/fsh'}), `${fhirVs.id}.fsh`);
      });
    }
  }

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.valueSetService.changeValueSetVersionStatus(this.version.valueSet, this.version.version, status).subscribe(() => this.version.status = status);
  }

  public openJson(expand: boolean = false): void {
    if (expand) {
      window.open(environment.termxApi + '/fhir/ValueSet/' + this.version.valueSet + SEPARATOR + this.version.version + '/$expand?includeDesignations=true' +
        (this.version.preferredLanguage ? '&displayLanguage=' + this.version.preferredLanguage : '') , '_blank');
    } else {
      window.open(environment.termxApi + '/fhir/ValueSet/' + this.version.valueSet + SEPARATOR + this.version.version , '_blank');
    }
  }

  public createTask(): void {
    if (!validateForm(this.taskModalForm)) {
      return;
    }

    const task = new Task();
    task.project = {code: 'termx'};
    task.workflow = 'version-' + this.taskModalData.type;
    task.type = 'task';
    task.status = 'requested';
    task.priority = 'routine';
    task.assignee = this.taskModalData.assignee;
    task.title = 'Value Set "' + this.version.valueSet + '" version "' + this.version.version + '" ' + this.taskModalData.type;
    task.content = (this.taskModalData.type === 'review' ? 'Review' : 'Approve')  +
      ' the content of the value set [' + this.version.valueSet + '|' + this.version.version + ']'+
      '(vsv:' + this.version.valueSet + '|' + this.version.version + ').';
    task.context = [{type: 'value-set', id: this.version.valueSet}, {type: 'value-set-version', id: this.version.id}];
    this.loader.wrap('create-task', this.taskService.save(task)).subscribe(() => {
      this.taskCreated.emit();
      this.notificationService.success('web.value-set-version.summary.task-modal.success-msg');
      this.taskModalData = {};
    });
  }

  protected getLastProvenance = (provenances: Provenance[], activity: string): Provenance => {
    return provenances?.filter(p => p.activity === activity).sort((p1, p2) => compareDates(new Date(p2.date), new Date(p1.date)))?.[0];
  };
}
