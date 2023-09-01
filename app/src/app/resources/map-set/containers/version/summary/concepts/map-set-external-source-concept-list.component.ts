import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {finalize, map, Observable, of} from 'rxjs';
import {
  AssociationType,
  MapSetAssociation, MapSetAssociationSearchParams, ValueSetVersionConcept
} from 'app/src/app/resources/_lib';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {NgForm} from '@angular/forms';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';


@Component({
  selector: 'tw-map-set-external-source-concept-list',
  templateUrl: 'map-set-external-source-concept-list.component.html'
})
export class MapSetExternalSourceConceptListComponent implements OnChanges {
  @Input() public mapSet: string;
  @Input() public mapSetVersion: string;
  @Input() public targetExternal: boolean;
  @Input() public associationTypes: AssociationType[];

  @ViewChild("form") public form?: NgForm;
  @ViewChild("modalForm") public modalForm?: NgForm;
  @ViewChild(MapSetAssociationDrawerComponent) public drawerComponent?: MapSetAssociationDrawerComponent;

  public associations: MapSetAssociation[];
  public rowInstance: MapSetAssociation = {relationship: 'equivalent', source: {}, target: {}};
  public loading: boolean;

  protected modalData: {visible?: boolean, content?: string} = {};


  public constructor(private mapSetService: MapSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['mapSet'] || changes['mapSetVersion']) && this.mapSet && this.mapSetVersion) {
      this.loadData();
    }
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.associations = resp);
  }

  protected search(): Observable<MapSetAssociation[]> {
    if (!this.mapSet || !this.mapSetVersion) {
      return of();
    }
    const q = new MapSetAssociationSearchParams();
    q.limit = -1;
    q.mapSet = this.mapSet;
    q.mapSetVersion = this.mapSetVersion;

    this.loading = true;
    return this.mapSetService.searchAssociations(this.mapSet, q).pipe(map(r => r.data), finalize(() => this.loading = false));
  }

  protected getRelationName = (relationship: string, relationships: AssociationType[]): string => {
    return relationships?.find(r => r.code === relationship)?.forwardName || relationship;
  };

  protected verify = (a: MapSetAssociation): void => {
    if (!isDefined(a.id)) {
      return;
    }
    this.mapSetService.verifyAssociations(this.mapSet, [a.id]).subscribe(() => this.loadData());
  };

  protected verifyChecked = (): void => {
    const  ids = this.associations?.filter(a => a['_checked'] && isDefined(a.id)).map(c => c.id);
    if (!ids || ids.length === 0) {
      return;
    }
    this.mapSetService.verifyAssociations(this.mapSet, ids).subscribe(() => this.loadData());
  };

  protected saveAssociations(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.mapSetService.saveAssociations(this.mapSet, this.mapSetVersion, this.associations).subscribe(() => this.loadData());
  }

  protected addAssociations(): void {
    const rows = this.modalData.content.split('\n').slice(1, this.modalData.content.split('\n').length);
    this.associations = [...rows.filter(r => {
      const cols = r.split(',');
      return isDefined(cols?.[0]) && cols?.[0] !== '';
    }).map(r => {
      const association = new MapSetAssociation();
      const cols = r.split(',');
      association.source = {code: cols?.[0], display: cols?.[1]};
      association.target = {code: cols?.[2], display: cols?.[3]};
      association.relationship = cols?.[4];
      return association;
    })];
    this.modalData.visible = false;
  }

  public openModal(): void {
    this.modalData.content = ['SourceCode', 'SourceDisplay',  'TargetCode', 'TargetDisplay', 'Relationship'].join(',') + '\n';
    this.associations?.forEach(a => this.modalData.content +=
      [(a.source.code || ''), (a.source.display || ''), (a.target.code || ''), (a.target.display || ''), (a.relationship || '')].join(",") + '\n');
    this.modalData.visible = true;
  }
}
