import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemConcept, MapSetAssociation, MapSetLibService, ValueSet, ValueSetLibService} from 'term-web/resources/_lib';
import {NgForm} from '@angular/forms';
import {isDefined} from '@kodality-web/core-util';
import {forkJoin} from 'rxjs';
import {PageLibService, PageRelation} from 'term-web/thesaurus/_lib';

@Component({
  selector: 'tw-code-system-concept-relations',
  templateUrl: './code-system-concept-relations.component.html',
})
export class CodeSystemConceptRelationsComponent implements OnChanges {
  @Input() public concept?: CodeSystemConcept;

  @ViewChild("form") public form?: NgForm;

  public relatedValueSets: ValueSet[] = [];
  public relatedMapSets: {direction: string, association: (MapSetAssociation | undefined)}[] = [];
  public relatedPages: PageRelation[] = [];
  public loading: {[k: string]: boolean} = {};

  public constructor(
    private valueSetService: ValueSetLibService,
    private mapSetService: MapSetLibService,
    private pageService: PageLibService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['concept'] && this.concept) {
      this.loadRelations(this.concept);
    }
  }

  private loadRelations(concept: CodeSystemConcept): void {
    this.loadRelatedValueSets(concept);
    this.loadRelatedMapSets(concept);
    this.loadRelatedPages(concept);
  }

  private loadRelatedValueSets(concept: CodeSystemConcept): void {
    this.loading['value-sets'] = true;
    this.valueSetService.search({codeSystem: concept.codeSystem, conceptCode: concept.code, limit: 999})
      .subscribe(result => this.relatedValueSets = result.data)
      .add(() => this.loading['value-sets'] = false);
  }

  private loadRelatedMapSets(concept: CodeSystemConcept): void {
    this.loading['map-sets'] = true;
    forkJoin([
      this.mapSetService.search({associationSourceCode: concept.code, associationSourceSystem: concept.codeSystem, associationsDecorated: true, limit: 999}),
      this.mapSetService.search({associationTargetCode: concept.code, associationTargetSystem: concept.codeSystem, associationsDecorated: true, limit: 999})
    ]).subscribe(([sourceMS, targetMS]) => {
      this.relatedMapSets =
        sourceMS.data.flatMap(ms => ms.associations).filter(a => a?.source?.code === concept.code || a?.target?.code === concept.code).filter(a => isDefined(a))
          .map(a => ({direction: 'source', association: a})) || [];
      this.relatedMapSets.push(...targetMS.data.flatMap(ms => ms.associations).filter(a => a?.source?.code === concept.code || a?.target?.code === concept.code)
        .filter(a => isDefined(a)).map(a => ({direction: 'target', association: a})));
    }).add(() => this.loading['map-sets'] = false);
  }

  private loadRelatedPages(concept: CodeSystemConcept): void {
    this.loading['pages'] = true;
    this.pageService.searchPageRelations({type: 'concept', target: concept.codeSystem + '|' + concept.code, limit: 999})
      .subscribe(result => this.relatedPages = result.data)
      .add(() => this.loading['pages'] = false);
  }
}
