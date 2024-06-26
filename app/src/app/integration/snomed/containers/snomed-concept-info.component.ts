import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {DestroyService, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {TranslateService} from '@ngx-translate/core';
import {AuthService} from 'app/src/app/core/auth';
import {SnomedConcept, SnomedDescription, SnomedLibService, SnomedRelationship} from 'app/src/app/integration/_lib';
import {MapSetLibService, ValueSetLibService} from 'app/src/app/resources/_lib';
import {PageLibService} from 'app/src/app/wiki/_lib';
import {forkJoin, of} from 'rxjs';
import {InfoService} from 'term-web/core/info/info.service';
import {SnomedTranslationListComponent} from 'term-web/integration/snomed/containers/snomed-translation-list.component';
import {SnomedTranslationService} from 'term-web/integration/snomed/services/snomed-translation.service';
import {LorqueLibService, Provenance} from 'term-web/sys/_lib';
import {Task} from 'term-web/task/_lib';
import {TaskService} from 'term-web/task/services/task-service';

@Component({
  selector: 'tw-snomed-concept-info',
  templateUrl: './snomed-concept-info.component.html',
  providers: [DestroyService]
})
export class SnomedConceptInfoComponent implements OnChanges {

  public loader = new LoadingManager();
  public concept?: SnomedConcept;
  public refsets?: SnomedConcept[];
  public snomedReferences?: SnomedConcept[];
  public ktsReferences?: {type?: string, id?: any, name?: string}[];
  public descriptions?: {[key: string]: SnomedDescription[]};
  public relationships?: SnomedRelationship[];
  public provenances?: Provenance[];
  public dataChanged?: boolean = false;

  protected taskModalData: {visible?: boolean, assignee?: string, comment?: string} = {};
  @ViewChild("taskModalForm") public taskModalForm?: NgForm;

  @Input() public conceptId?: string;
  @Input() public branch?: string;
  @Output() public conceptSelected: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(SnomedTranslationListComponent) public translationListComponent?: SnomedTranslationListComponent;

  public constructor(
    private snomedService: SnomedLibService,
    private snomedTranslationService: SnomedTranslationService,
    private valueSetService: ValueSetLibService,
    private mapSetService: MapSetLibService,
    private pageService: PageLibService,
    private translateService: TranslateService,
    private lorqueService: LorqueLibService,
    private authService: AuthService,
    private destroy$: DestroyService,
    private notificationService: MuiNotificationService,
    private taskService: TaskService,
    private info: InfoService,
    private router: Router
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['conceptId'] || changes['branch']) && isDefined(this.conceptId)) {
      this.loadConceptData(this.conceptId);
      this.snomedReferences = undefined;
      this.dataChanged = false;
    }
  }

  private loadConceptData(conceptId: string): void {
    this.descriptions = {};
    this.loader.wrap('load', forkJoin([
      this.snomedService.loadConcept(conceptId, this.branch),
      this.snomedService.loadRefsets(conceptId, this.branch),
    ])).subscribe(([concept, refsets]) => {
      this.concept = concept;
      this.refsets = refsets;
      this.descriptions = this.processDescriptions(concept.descriptions!);
      this.relationships = concept.relationships;
    });
  }

  private processDescriptions(descriptions: SnomedDescription[]): {[key: string]: SnomedDescription[]} {
    const refsetDescriptions: {[key: string]: SnomedDescription[]} = {};
    descriptions.forEach(description => {
      Object.keys(description.acceptabilityMap!).forEach(refset => {
        refsetDescriptions[refset] = refsetDescriptions[refset] ? [...refsetDescriptions[refset], description] : [description];
      });
    });
    return refsetDescriptions;
  }

  public loadSnomedReferences(): void {
    this.loader.wrap('snomed-references', this.snomedService.findConceptChildren(this.conceptId, this.branch))
      .subscribe(children => this.snomedReferences = children);
  }

  public loadKtsReferences(): void {
    this.loader.wrap('modules', this.info.modules()).subscribe(modules => {
      this.loader.wrap('kts-references', forkJoin([
        this.authService.hasPrivilege('*.ValueSet.view') ? this.valueSetService.search({codeSystem: 'snomed-ct', conceptCode: this.conceptId, limit: 100}) : of({data: []}),
        this.authService.hasPrivilege('*.MapSet.view') ? this.mapSetService.search({associationSourceCode: this.conceptId, associationSourceSystem: 'snomed-ct', associationsDecorated: true, limit: 100}) : of({data: []}),
        this.authService.hasPrivilege('*.MapSet.view') ? this.mapSetService.search({associationTargetCode: this.conceptId, associationTargetSystem: 'snomed-ct', associationsDecorated: true, limit: 100}) : of({data: []}),
        this.authService.hasPrivilege('*.Page.view') && modules.includes('wiki') ? this.pageService.searchPageRelations({type: 'concept', target: 'snomed-ct|' + this.conceptId, limit: 100}) : of({data: []})]
      )).subscribe(([vs, ms1, ms2, p]) => {
        const lang = this.translateService.currentLang;
        this.ktsReferences = [
          ...vs.data.map(d => ({type: 'Value set', id: d.id, name: d.title[lang] || Object.values(d.title)?.[0] || '-'})),
          ...ms1.data.map(d => ({type: 'Map set', id: d.id, name: d.title[lang] || Object.values(d.title)?.[0] || '-'})),
          ...ms2.data.map(d => ({type: 'Map set', id: d.id, name: d.title[lang] || Object.values(d.title)?.[0] || '-'})),
          ...p.data.map(d => ({type: 'Page', id: d.content.code, name: d.content.names[lang] || Object.values(d.content.names)?.[0]}))
        ];
      });
    });
  }

  public openReference(type: string, id: any): void {
    if (type === 'Value set') {
      const canEdit = this.authService.hasPrivilege(id + '.ValueSet.edit');
      this.router.navigate(['/resources/value-sets', id, canEdit ? 'edit' : 'view']);
    }
    if (type === 'Map set') {
      const canEdit = this.authService.hasPrivilege(id + '.MapSet.edit');
      this.router.navigate(['/resources/map-sets', id, canEdit ? 'edit' : 'view']);
    }
    if (type === 'Page') {
      this.router.navigate(['/wiki/pages/', id]);
    }
  }

  public saveTranslations(): void {
    const valid = this.translationListComponent.validate();
    if (valid && this.conceptId) {
      this.loader.wrap('save', this.snomedTranslationService.save(this.conceptId, this.translationListComponent.translations)).subscribe(() => {
        this.translationListComponent.loadTranslations(this.conceptId);
        this.dataChanged = false;
      });
    }
  }

  public exportToRF2(): void {
    this.snomedTranslationService.startRF2Export().subscribe(process => {
      this.loader.wrap('rf2-export', this.lorqueService.pollFinishedProcess(process.id, this.destroy$)).subscribe(status => {
        if (status === 'failed') {
          this.lorqueService.load(process.id).subscribe(p => this.notificationService.error(p.resultText));
          return;
        }
        this.snomedTranslationService.getRF2(process.id);
      });
    });
  }

  public loadProvenances(): void {
    this.loader.wrap('kts-references', this.snomedTranslationService.loadProvenances(this.conceptId)).subscribe(p => {
      this.provenances = p;
    });
  }

  public createTask(): void {
    if (!validateForm(this.taskModalForm)) {
      return;
    }

    const task = new Task();
    task.workflow = 'concept-review';
    task.assignee = this.taskModalData.assignee;
    task.title = `Review code system "snomed-ct" concept "${this.conceptId}"`;
    task.content = this.taskModalData.comment;
    task.context = [{type: 'code-system', id: 'snomed-ct'}, {type: 'snomed-concept', id: this.conceptId}];
    this.loader.wrap('create-task', this.taskService.save(task)).subscribe(() => {
      this.notificationService.success('web.snomed.task.success-msg');
      this.taskModalData = {};
    });
  }
}
