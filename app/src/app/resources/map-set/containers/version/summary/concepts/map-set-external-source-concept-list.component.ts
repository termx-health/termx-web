import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {AssociationType, MapSet, MapSetAssociation, MapSetAssociationSearchParams} from 'app/src/app/resources/_lib';
import {finalize, map, Observable, of} from 'rxjs';
import {MapSetAssociationDrawerComponent} from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-drawer.component';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';


@Component({
  selector: 'tw-map-set-external-source-concept-list',
  templateUrl: 'map-set-external-source-concept-list.component.html'
})
export class MapSetExternalSourceConceptListComponent implements OnChanges {
  @Input() public mapSet: MapSet;
  @Input() public mapSetVersion: string;
  @Input() public targetExternal: boolean;
  @Input() public associationTypes: AssociationType[];
  @Input() public editMode: boolean;
  @Output() public associationsChanged: EventEmitter<void> = new EventEmitter<void>();

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
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return of();
    }
    const q = new MapSetAssociationSearchParams();
    q.limit = -1;
    q.mapSet = this.mapSet.id;
    q.mapSetVersion = this.mapSetVersion;

    this.loading = true;
    return this.mapSetService.searchAssociations(this.mapSet.id, q).pipe(map(r => r.data), finalize(() => this.loading = false));
  }

  protected getRelationName = (relationship: string, relationships: AssociationType[]): string => {
    return relationships?.find(r => r.code === relationship)?.forwardName || relationship;
  };

  protected verifyChecked = (): void => {
    if (!this.mapSet?.id || !this.mapSetVersion) {
      return;
    }
    const verifiedIds = this.associations?.filter(a => a.verified && isDefined(a.id)).map(c => c.id);
    const unVerifiedIds = this.associations?.filter(a => !a.verified && isDefined(a.id)).map(c => c.id);
    this.mapSetService.verifyAssociations(this.mapSet.id, this.mapSetVersion, verifiedIds, unVerifiedIds).subscribe(() => this.loadData());
  };

  protected saveAssociations(): void {
    if (!this.mapSet?.id || !this.mapSetVersion || !validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.mapSetService.saveAssociations(this.mapSet.id, this.mapSetVersion, this.associations).subscribe(() => {
      this.loadData();
      this.associationsChanged.emit();
    });
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
