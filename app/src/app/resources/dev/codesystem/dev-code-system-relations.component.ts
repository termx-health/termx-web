import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemLibService, MapSet, MapSetLibService, ValueSet, ValueSetLibService, ValueSetTransactionRequest} from 'term-web/resources/_lib';
import {forkJoin} from 'rxjs';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'tw-dev-cs-relations',
  templateUrl: 'dev-code-system-relations.component.html'
})
export class DevCodeSystemRelationsComponent implements OnChanges {
  @Input() public codeSystemId?: string | null;
  @Input() public currentCodeSystemId?: string | null;
  @ViewChild("form") public form?: NgForm;

  public loading: {[k: string]: boolean} = {};

  public generateValueSet: boolean = false;
  public valueSet: ValueSet = {versions: [{status: 'draft', version: '1'}]};

  public relatedValueSets: ValueSet[] = [];
  public relatedMapSets: MapSet[] = [];


  public constructor(
    private codeSystemService: CodeSystemLibService,
    private valueSetService: ValueSetLibService,
    private mapSetService: MapSetLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadRelations(this.codeSystemId);
    }
  }

  private loadRelations(csId: string): void {
    this.loadRelatedValueSets(csId);
    this.loadRelatedMapSets(csId);
  }

  private loadRelatedValueSets(csId: string): void {
    this.loading['value-sets'] = true;
    this.valueSetService.search({codeSystem: csId, limit: 999})
      .subscribe(result => this.relatedValueSets = result.data)
      .add(() => this.loading['value-sets'] = false);
  }

  private loadRelatedMapSets(csId: string): void {
    this.loading['map-sets'] = true;
    forkJoin([
      this.mapSetService.search({associationSourceSystem: csId, associationsDecorated: true, limit:999}),
      this.mapSetService.search({associationTargetSystem: csId, associationsDecorated: true, limit:999})
    ]).subscribe(([sourceMS, targetMS]) => {
      this.relatedMapSets = sourceMS.data || [];
      this.relatedMapSets.push(...targetMS.data);
    }).add(() => this.loading['map-sets'] = false);
  }

  public publisherChanged(publisher: string): void {
    if (!publisher) {
      return;
    }
    forkJoin([
      this.codeSystemService.searchProperties('publisher', {name: 'uri'}),
      this.codeSystemService.loadConcept('publisher', publisher)
    ]).subscribe(([prop, c]) => {
      const activeVersion = c.versions?.find(v => v.status === 'active');
      if (activeVersion) {
        const uri = activeVersion.propertyValues?.find(pv => prop.data.map(p => p.id).includes(pv.entityPropertyId))?.value;
        this.valueSet!.uri = uri && this.valueSet!.id ? uri + '/ValueSet/' + this.valueSet!.id : this.valueSet!.uri;
      }
    });
  }

  public valid(): boolean {
    return !this.generateValueSet || validateForm(this.form);
  }

  public geValueSet(): ValueSetTransactionRequest | undefined {
    return this.generateValueSet ? {valueSet: this.valueSet, version: this.valueSet.versions?.[0]} : undefined;
  }

  public generate(generate: boolean): void {
    if (generate) {
      this.valueSet.id = this.currentCodeSystemId ? this.currentCodeSystemId + '-vs' : this.valueSet.id;
    }
  }
}
