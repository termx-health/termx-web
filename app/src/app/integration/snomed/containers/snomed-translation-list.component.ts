import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {
  SnomedTranslation,
  SnomedTranslationLibService
} from 'app/src/app/integration/_lib';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {CodeSystemConcept, CodeSystemLibService, ConceptUtil} from 'term-web/resources/_lib';

@Component({
  selector: 'tw-snomed-translations',
  templateUrl: './snomed-translation-list.component.html',
})
export class SnomedTranslationListComponent implements OnInit, OnChanges {
  public translations: SnomedTranslation[];
  protected modules: CodeSystemConcept[];
  protected loader = new LoadingManager();
  protected rowInstance: SnomedTranslation = {type: 'synonym'};

  @Input() public conceptId?: string;
  @Output() public translationsChanged: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemLibService,
    private snomedTranslationService: SnomedTranslationLibService
  ) {}

  public ngOnInit(): void {
    this.codeSystemService.searchConcepts('snomed-module', {limit: -1}).subscribe(resp => {
      this.modules = resp.data;
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
    this.loader.wrap('load', this.snomedTranslationService.loadTranslations(conceptId)).subscribe(resp => this.translations = resp);
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

  public validate(): boolean {
    return validateForm(this.form);
  }
}
