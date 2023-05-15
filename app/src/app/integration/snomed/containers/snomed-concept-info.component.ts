import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {SnomedConcept, SnomedDescription, SnomedLibService, SnomedRelationship} from 'app/src/app/integration/_lib';
import {forkJoin} from 'rxjs';
import {isDefined, LoadingManager} from '@kodality-web/core-util';
import {MapSetLibService, ValueSetLibService} from 'app/src/app/resources/_lib';
import {PageLibService} from 'app/src/app/thesaurus/_lib';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {AuthService} from 'app/src/app/core/auth';
import {SnomedTranslationListComponent} from 'term-web/integration/snomed/containers/snomed-translation-list.component';
import {SnomedTranslationService} from 'term-web/integration/snomed/services/snomed-translation.service';

@Component({
  selector: 'tw-snomed-concept-info',
  templateUrl: './snomed-concept-info.component.html',
})
export class SnomedConceptInfoComponent implements OnChanges {

  public loader = new LoadingManager();
  public concept?: SnomedConcept;
  public refsets?: SnomedConcept[];
  public snomedReferences?: SnomedConcept[];
  public ktsReferences?: {type?: string, id?: any, name?: string}[];
  public descriptions?: {[key: string]: SnomedDescription[]};
  public relationships?: SnomedRelationship[];
  public dataChanged: boolean = false;

  @Input() public conceptId?: string;
  @Output() public conceptSelected: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild(SnomedTranslationListComponent) public translationListComponent?: SnomedTranslationListComponent;

  public constructor(
    private snomedService: SnomedLibService,
    private snomedTranslationService: SnomedTranslationService,
    private valueSetService: ValueSetLibService,
    private mapSetService: MapSetLibService,
    private pageService: PageLibService,
    private translateService: TranslateService,
    private authService: AuthService,
    private router: Router
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['conceptId'] && isDefined(this.conceptId)) {
      this.loadConceptData(this.conceptId);
      this.snomedReferences = undefined;
      this.dataChanged = false;
    }
  }

  private loadConceptData(conceptId: string): void {
    this.descriptions = {};
    this.loader.wrap('load', forkJoin([
      this.snomedService.loadConcept(conceptId),
      this.snomedService.loadRefsets(conceptId),
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
        refsetDescriptions[refset] = refsetDescriptions[refset] ? [...refsetDescriptions[refset], description] : [];
      });
    });
    return refsetDescriptions;
  }

  public loadSnomedReferences(): void {
    this.loader.wrap('snomed-references', this.snomedService.findConceptChildren(this.conceptId))
      .subscribe(children => this.snomedReferences = children);
  }

  public loadKtsReferences(): void {
    this.loader.wrap('kts-references', forkJoin([
      this.valueSetService.search({codeSystem: 'snomed-ct', conceptCode: this.conceptId, limit: 100}),
      this.mapSetService.search({associationSourceCode: this.conceptId, associationSourceSystem: 'snomed-ct', associationsDecorated: true, limit: 100}),
      this.mapSetService.search({associationTargetCode: this.conceptId, associationTargetSystem: 'snomed-ct', associationsDecorated: true, limit: 100}),
      this.pageService.searchPageRelations({type: 'concept', target: 'snomed-ct|' + this.conceptId, limit: 100})]
    )).subscribe(([vs, ms1, ms2, p]) => {
      const lang = this.translateService.currentLang;
      this.ktsReferences = [
        ...vs.data.map(d => ({type: 'Value set', id: d.id, name: d.names[lang] || Object.values(d.names)?.[0] || '-'})),
        ...ms1.data.map(d => ({type: 'Map set', id: d.id, name: d.names[lang] || Object.values(d.names)?.[0] || '-'})),
        ...ms2.data.map(d => ({type: 'Map set', id: d.id, name: d.names[lang] || Object.values(d.names)?.[0] || '-'})),
        ...p.data.map(d => ({type: 'Page', id: d.content.code, name: d.content.names[lang] || Object.values(d.content.names)?.[0]}))
      ];
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
      this.router.navigate(['/thesaurus/pages/', id]);
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
}
