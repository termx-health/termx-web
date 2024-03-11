import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {SnomedBranch, SnomedLibService, SnomedTranslation, SnomedTranslationLibService} from 'app/src/app/integration/_lib';
import {forkJoin} from 'rxjs';
import {AuthService} from 'term-web/core/auth';
import {CodeSystemConcept, CodeSystemLibService, ConceptUtil} from 'term-web/resources/_lib';
import {Task, TaskLibService} from 'term-web/task/_lib';

@Component({
  selector: 'tw-snomed-translations',
  templateUrl: './snomed-translation-list.component.html',
})
export class SnomedTranslationListComponent implements OnInit, OnChanges {
  public translations: SnomedTranslation[];
  protected tasks: Task[];
  protected modules: CodeSystemConcept[];
  protected branches: SnomedBranch[];
  protected loader = new LoadingManager();
  protected rowInstance: SnomedTranslation = {type: 'synonym'};

  @Input() public conceptId?: string;
  @Output() public translationsChanged: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private authService: AuthService,
    private snomedService: SnomedLibService,
    private snomedTranslationService: SnomedTranslationLibService,
    private taskService: TaskLibService
  ) {}

  public ngOnInit(): void {

    this.loader.wrap('load', forkJoin([
      this.codeSystemService.searchConcepts('snomed-module', {limit: -1}),
      this.snomedService.loadBranches(),
      this.snomedService.loadCodeSystems()
    ])).subscribe(([modules, branches, codeSystems]) =>{
      this.modules = modules.data.filter(m => m.versions?.find(v => v.status !== 'retired'));
      this.branches = branches.filter(b => !!codeSystems.find(cs => cs.branchPath == b.path && cs.dailyBuildAvailable) ||
        !codeSystems.find(cs => !!cs.versions.find(v => v.branchPath === b.path)));
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['conceptId']) {
      this.loadTranslations(this.conceptId);
    }
  }

  public loadTranslations(conceptId: string): void {
    this.translations = [];
    if (!isDefined(conceptId)) {
      return;
    }
    this.loader.wrap('load', this.snomedTranslationService.loadConceptTranslations(conceptId)).subscribe(resp => {
      this.translations = resp;
      const translationIds = resp.map(r => r.id);
      if (translationIds.length > 0 && this.authService.hasPrivilege('*.Task.view')) {
        this.taskService.searchTasks({context: translationIds.map(id => 'snomed-translation|' + id).join(','), limit: -1}).subscribe(tasks => {
          this.tasks = tasks.data;
        });
      }
    });
  }

  protected addRow(): void {
    this.translations = [...this.translations, copyDeep(this.rowInstance)];
    this.translationsChanged.emit();
  }

  protected langsDefined = (module: string): boolean => {
    const langs = this.getLangs(module);
    return langs?.length > 0;
  };

  protected getLangs = (module: string): {code: string, codeSystem: string}[] => {
    if (!module) {
      return [];
    }
    return ConceptUtil.getLastVersion(this.modules?.find(m => m.code === module))?.propertyValues?.filter(pv => pv.entityProperty === 'language')?.map(pv => pv.value);
  };

  protected editAllowed = (translation: SnomedTranslation): boolean => {
    return translation.status !== 'A';
  };

  protected findTask = (tasks: Task[], translationId: number): Task => {
    return tasks?.find(t => isDefined(t.context?.find(c => c.id === translationId)));
  };

  public validate(): boolean {
    return validateForm(this.form);
  }
}
