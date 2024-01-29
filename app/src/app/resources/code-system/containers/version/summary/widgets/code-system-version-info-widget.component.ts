import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystem, CodeSystemVersion} from 'app/src/app/resources/_lib';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {FhirCodeSystemLibService, SEPARATOR} from 'app/src/app/fhir/_lib';
import {ChefService} from 'app/src/app/integration/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {environment} from 'app/src/environments/environment';
import {CodeSystemService} from 'app/src/app/resources/code-system/services/code-system.service';
import {NgForm} from '@angular/forms';
import {compareDates, DestroyService, LoadingManager, validateForm} from '@kodality-web/core-util';
import {TaskService} from 'term-web/task/services/task-service';
import {Task} from 'term-web/task/_lib';
import {LorqueLibService, Provenance} from 'term-web/sys/_lib';
import {Space, SpaceLibService} from 'term-web/space/_lib';
import {AuthService} from 'term-web/core/auth';
import {Router} from '@angular/router';

@Component({
  selector: 'tw-code-system-version-info-widget',
  templateUrl: 'code-system-version-info-widget.component.html',
  providers: [DestroyService]
})
export class CodeSystemVersionInfoWidgetComponent implements OnChanges {
  protected SEPARATOR = SEPARATOR;
  @Input() public codeSystem: CodeSystem;
  @Input() public version: CodeSystemVersion;
  @Output() public taskCreated: EventEmitter<void> = new EventEmitter();

  protected taskModalData: {visible?: boolean, assignee?: string, type?: 'review' | 'approval'} = {};
  protected provenances: Provenance[];
  protected githubSpaces: Space[];
  @ViewChild("taskModalForm") public taskModalForm?: NgForm;

  protected loader = new LoadingManager();

  public constructor(
    private codeSystemService: CodeSystemService,
    private fhirCodeSystemService: FhirCodeSystemLibService,
    private taskService: TaskService,
    private chefService: ChefService,
    private notificationService: MuiNotificationService,
    private spaceService: SpaceLibService,
    private authService: AuthService,
    private lorqueService: LorqueLibService,
    private destroy$: DestroyService,
    private router: Router
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['version'] && this.version) {
      this.loader.wrap('provenance', this.codeSystemService.loadProvenances(this.version.codeSystem, this.version.version))
        .subscribe(resp => this.provenances = resp);
      if (this.authService.hasPrivilege('*.Space.view')) {
        this.spaceService.search({resource: 'code-system|' + this.version.codeSystem}).subscribe(r => {
          this.githubSpaces = r.data.filter(s => !!s.integration?.github?.repo
            && (Object.keys(s.integration.github.dirs || {}).some(d => ['codesystem-fhir-json', 'codesystem-fhir-fsh'].includes(d)))
          );
        });
      }
    }
  }

  protected downloadDefinition(format: string): void {
    if (['csv', 'xlsx'].includes(format)) {
      this.codeSystemService.exportConcepts(this.version.codeSystem, this.version.version, format).subscribe(process => {
        this.lorqueService.pollFinishedProcess(process.id, this.destroy$).subscribe(status => {
          if (status === 'failed') {
            this.lorqueService.load(process.id).subscribe(p => this.notificationService.error(p.resultText));
          } else  {
            this.codeSystemService.getConceptExportResult(process.id, format);
          }
        });
      });
    } else {
      this.fhirCodeSystemService.loadCodeSystem(this.version.codeSystem, this.version.version).subscribe(fhirCs => {
        this.saveFile(fhirCs, format);
      });
    }
  }

  private saveFile(fhirCs: any, format: string): void {
    const json = JSON.stringify(fhirCs, null, 2);

    if (format === 'json') {
      saveAs(new Blob([json], {type: 'application/json'}), `${fhirCs.id}.json`);
    }
    if (format === 'xml') {
      const xml = new Fhir().jsonToXml(json);
      saveAs(new Blob([xml], {type: 'application/xml'}), `${fhirCs.id}.xml`);
    }
    if (format === 'fsh') {
      this.chefService.fhirToFsh({fhir: [json]}).subscribe(r => {
        r.warnings?.forEach(w => this.notificationService.warning('JSON to FSH conversion warning', w.message!, {duration: 0, closable: true}));
        r.errors?.forEach(e => this.notificationService.error('JSON to FSH conversion failed!', e.message!, {duration: 0, closable: true}));
        const fsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        saveAs(new Blob([fsh], {type: 'application/fsh'}), `${fhirCs.id}.fsh`);
      });
    }
  }

  protected changeVersionStatus(status: 'draft' | 'active' | 'retired'): void {
    this.codeSystemService.changeCodeSystemVersionStatus(this.version.codeSystem, this.version.version, status).subscribe(() => this.version.status = status);
  }

  public openJson(): void {
    window.open(window.location.origin + environment.baseHref + 'fhir/CodeSystem/' + this.version.codeSystem + SEPARATOR + this.version.version, '_blank');
  }

  public createTask(): void {
    if (!validateForm(this.taskModalForm)) {
      return;
    }

    const task = new Task();
    task.workflow = 'version-' + this.taskModalData.type;
    task.assignee = this.taskModalData.assignee;
    task.title = 'Code System "' + this.version.codeSystem + '" version "' + this.version.version + '" ' + this.taskModalData.type;
    task.content = (this.taskModalData.type === 'review' ? 'Review' : 'Approve') +
      ' the content of the code system [' + this.version.codeSystem + '|' + this.version.version + ']' +
      '(csv:' + this.version.codeSystem + '|' + this.version.version + ').';
    task.context = [{type: 'code-system', id: this.version.codeSystem}, {type: 'code-system-version', id: this.version.id}];
    this.loader.wrap('create-task', this.taskService.save(task)).subscribe(() => {
      this.taskCreated.emit();
      this.notificationService.success('web.code-system-version.summary.task-modal.success-msg');
      this.taskModalData = {};
    });
  }

  protected getLastProvenance = (provenances: Provenance[], activity: string): Provenance => {
    return provenances?.filter(p => p.activity === activity).sort((p1, p2) => compareDates(new Date(p2.date), new Date(p1.date)))?.[0];
  };

  protected openVersionConcepts(): void {
    this.router.navigate(['/resources/code-systems', this.version.codeSystem, 'versions', this.version.version, 'concepts']);
  }
}
