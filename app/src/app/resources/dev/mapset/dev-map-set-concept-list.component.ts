import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  CodeSystemConcept,
  CodeSystemEntityVersion, CodeSystemLibService,
  Designation,
  MapSet,
  MapSetAssociation,
  MapSetVersion,
  ValueSetLibService,
  ValueSetVersionConcept
} from 'term-web/resources/_lib';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MapSetService} from '../../map-set/services/map-set-service';
import {forkJoin} from 'rxjs';
import {compareValues, copyDeep, isDefined, SearchResult, validateForm} from '@kodality-web/core-util';
import {DevMapSetUnmappedConceptListComponent} from './dev-map-set-unmapped-concept-list.component';
import {v4 as uuid} from 'uuid';

@Component({
  templateUrl: 'dev-map-set-concept-list.component.html'
})
export class DevMapSetConceptListComponent implements OnInit {
  public mapSetId?: string | null;
  public mapSet?: MapSet;
  public mapSetVersion?: MapSetVersion;
  public sourceConcepts?: CodeSystemConcept[];
  public sourceProperties?: string[];
  public unmappedSourceConcepts?: CodeSystemConcept[];
  public targetConcepts?: CodeSystemConcept[];
  public targetProperties?: string[];
  public unmappedTargetConcepts?: CodeSystemConcept[];

  public loading: {[k: string]: boolean} = {};

  public modalData?: {
    visible?: boolean,
    sourceProperty?: string,
    targetProperty?: string
  } = {};

  protected rowInstance: MapSetAssociation = {source: {}, target: {}, status: 'draft', versions: [{status: 'draft'}]};
  protected mappingSearchOptions: {text?: string, unmapped?: boolean} = {};
  protected filteredMapSetAssociations: MapSetAssociation[];

  @ViewChild("form") public form?: NgForm;
  @ViewChild("modalForm") public modalForm?: NgForm;
  @ViewChild("unmappedSourceConceptList") public unmappedSourceConceptList?: DevMapSetUnmappedConceptListComponent;
  @ViewChild("unmappedTargetConceptList") public unmappedTargetConceptList?: DevMapSetUnmappedConceptListComponent;

  public constructor(
    private translateService: TranslateService,
    private mapSetService: MapSetService,
    private valueSetService: ValueSetLibService,
    private codeSystemService: CodeSystemLibService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    this.loadData();
  }

  private loadData(): void {
    this.loading ['init'] = true;
    this.mapSetService.load(this.mapSetId!, true).subscribe(ms => {
      this.mapSet = ms;
      this.mapSetVersion = this.getLastMapSetVersion(ms.versions!);
      this.initFilteredAssociations();
      this.loadConcepts(ms);
    }).add(() => this.loading ['init'] = false);
  }

  private loadConcepts(ms: MapSet): void {
    const csSourceRequests = ms.sourceCodeSystems?.length > 0 ? ms.sourceCodeSystems.map(cs => this.codeSystemService.searchConcepts(cs, {limit: 10_000})) : [];
    const vsSourceRequests = !(ms.sourceCodeSystems?.length > 0) && ms.sourceValueSet ? [this.valueSetService.expand({valueSet: ms.sourceValueSet})] : [];
    const csTargetRequests = ms.targetCodeSystems?.length > 0 ? ms.targetCodeSystems.map(cs => this.codeSystemService.searchConcepts(cs, {limit: 10_000})) : [];
    const vsTargetRequests = !(ms.targetCodeSystems?.length > 0) && ms.targetValueSet ? [this.valueSetService.expand({valueSet: ms.targetValueSet})] : [];

    this.sourceConcepts = [];
    this.targetConcepts = [];

    forkJoin([
      ...csSourceRequests,
      ...vsSourceRequests
    ]).subscribe((responses) => {
      responses.forEach(r => {
        this.sourceConcepts = [...this.sourceConcepts, ...this.extractConcepts(r)];
        this.sourceProperties = [...new Set(this.sourceConcepts?.flatMap(c => c.versions.flatMap(v => [...v.propertyValues!.map(v => v.entityProperty!), ...v.designations!.map(d => d.designationType!)])))];
        this.unmappedSourceConcepts = this.sourceConcepts?.filter(c => this.isUnmapped(c, 'source'));
      });
    });

    forkJoin([
      ...csTargetRequests,
      ...vsTargetRequests
    ]).subscribe((responses) => {
      responses.forEach(r => {
        this.targetConcepts = [...this.targetConcepts, ...this.extractConcepts(r)];
        this.targetProperties = [...new Set(this.targetConcepts?.flatMap(c => c.versions.flatMap(v => [...v.propertyValues!.map(v => v.entityProperty!), ...v.designations!.map(d => d.designationType!)])))];
        this.unmappedTargetConcepts = this.targetConcepts?.filter(c => this.isUnmapped(c, 'target'));
      });
    });
  }

  protected openEdit(): void {
    if (!this.mapSetId) {
      return;
    }
    this.router.navigate(['/resources/dev/map-sets/', this.mapSetId, 'edit']);
  }

  private isUnmapped(concept: CodeSystemConcept, type: 'target' | 'source'): boolean {
    if (type === 'source') {
      return !isDefined(this.mapSetVersion?.associations?.find(a => a?.source?.code === concept?.code));
    }
    if (type === 'target') {
      return !isDefined(this.mapSetVersion?.associations?.find(a => a?.target?.code === concept?.code));
    }
    return true;
  };

  protected mapConcepts(): void {
    const associations = this.mapSetVersion?.associations || [];

    const association = new MapSetAssociation();
    association.associationType = 'equal';
    association.source = this.getLastVersion(this.unmappedSourceConceptList.selectedConcept.versions);
    association.target = this.getLastVersion(this.unmappedTargetConceptList.selectedConcept.versions);
    association.status = 'draft';
    association.versions = [{status: 'draft'}];

    this.saveAssociations([...associations, association]);
  }

  private getLastVersion(versions: CodeSystemEntityVersion[]): CodeSystemEntityVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }

  private getLastMapSetVersion(versions: MapSetVersion[]): MapSetVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.created, b.created))?.[0];
  }

  protected populateAll(): void {
    this.unmappedSourceConceptList?.populate();
    this.unmappedTargetConceptList?.populate();
  }

  protected toggleModal(visible?: boolean): void {
    this.modalData = {visible: !!visible};
  }

  protected findDisplay = (designations?: Designation[]): string => {
    return designations?.find(d => d.language === this.translateService.currentLang)?.name || '';
  };

  protected automap(): void {
    if (this.modalForm && !validateForm(this.modalForm)) {
      return;
    }
    const sourceProperty = this.modalData!.sourceProperty!;
    const targetProperty = this.modalData!.targetProperty!;

    const associations = this.mapSetVersion?.associations || [];

    this.unmappedSourceConceptList?.unmappedConcepts?.forEach(sourceConcept => {
      const sourceDesignations = sourceConcept?.versions?.flatMap(v => v.designations)?.filter(d => d!.designationType === sourceProperty)
        ?.map(d => d?.name!);
      const sourceProperties = sourceConcept?.versions?.flatMap(v => v.propertyValues)?.filter(d => d!.entityProperty === sourceProperty)
        ?.map(d => d?.value!);
      const sourceValues = [...(sourceDesignations || []), ...(sourceProperties || []), ...(sourceProperty === 'code' ? [sourceConcept.code] : [])];
      const targetConcept = this.unmappedTargetConceptList?.unmappedConcepts?.find(t => {
        const targetDesignations = t?.versions?.flatMap(v => v.designations)?.filter(d => d!.designationType === targetProperty)?.map(d => d?.name!);
        const targetProperties = t?.versions?.flatMap(v => v.propertyValues)?.filter(d => d!.entityProperty === targetProperty)?.map(d => d?.value!);
        const targetValues = [...targetDesignations, ...targetProperties, ...(targetProperty === 'code' ? [t?.code] : [])];
        return targetValues.find(v => sourceValues.includes(v));
      });
      if (isDefined(targetConcept)) {
        const association = new MapSetAssociation();
        association.associationType = 'equal';
        association.source = this.getLastVersion(sourceConcept.versions);
        association.target = this.getLastVersion(targetConcept.versions);
        association.status = 'draft';
        association.versions = [{status: 'draft'}];
        associations.push(association);
      }
    });
    this.toggleModal(false);
    this.saveAssociations(associations);
  }

  protected deleteEmptyRelations(): void {
    this.mapSetVersion.associations = this.mapSetVersion.associations.filter(a => isDefined(a.source?.code) && isDefined(a.target?.code));
  }

  protected filterAssociations = (text: string, unmapped: boolean): void => {
    this.filteredMapSetAssociations = this.mapSetVersion.associations.filter(a => {
      const containsText = !text || a.source?.code?.includes(text) || a.target?.code?.includes(text);
      const isUnMapped = !unmapped || !a.source?.code || !a.target?.code;
      return containsText && isUnMapped;
    });
  };

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.saveAssociations(this.mapSetVersion.associations);
  }

  private saveAssociations(associations: MapSetAssociation[]): void {
    this.loading['save'] = true;
    this.mapSetService.saveTransaction({mapSet: this.mapSet!, version: this.mapSetVersion, associations: associations}).subscribe(() => {
      this.loadData();
    }).add(this.loading['save'] = false);
  }

  protected conceptSelected(code: string, association: MapSetAssociation, type: 'source' | 'target'): void {
    const concept = (type === 'source' ? this.sourceConcepts : this.targetConcepts).find(c => c.code === code);
    if (type === 'source') {
      association.source = concept && this.getLastVersion(concept.versions) || undefined;
    }
    if (type === 'target') {
      association.target = concept && this.getLastVersion(concept.versions) || undefined;
    }
  }

  protected deleteAssociation(association: MapSetAssociation): void {
    this.mapSetVersion.associations = this.mapSetVersion.associations.filter(a => a['_id'] !== association['_id']);
  }

  private initFilteredAssociations(): void {
    this.mapSetVersion.associations.forEach(a => a['_id'] = uuid());
    this.filteredMapSetAssociations = copyDeep(this.mapSetVersion.associations);
  }

  public addAssociation(): void {
    const association = {source: {}, target: {}, status: 'draft', versions: [{status: 'draft'}]};
    association['_id'] = uuid();
    this.filteredMapSetAssociations = [...this.filteredMapSetAssociations, association];
    this.mapSetVersion.associations = [...this.mapSetVersion.associations, association];
  }

  private extractConcepts(r: SearchResult<CodeSystemConcept> | ValueSetVersionConcept[]): CodeSystemConcept[] {
    if (r instanceof Array) {
      return r.map(c => c.concept);
    }
    return r.data;
  }
}
