import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MapSetEntityVersionSearchParams} from 'terminology-lib/resources';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {BooleanInput, copyDeep, SearchResult, validateForm} from '@kodality-web/core-util';
import {MapSetEntityVersion} from 'terminology-lib/resources/mapset/model/map-set-entity-version';
import {MapSetService} from '../../services/map-set-service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-map-set-version-entity-version-table',
  templateUrl: './map-set-version-entity-version-table.component.html',
})
export class MapSetVersionEntityVersionTableComponent implements OnInit {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public mapSetId?: string | null;
  @Input() public mapSetVersion?: string | null;

  public query = new MapSetEntityVersionSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<MapSetEntityVersion> = SearchResult.empty();
  public loading = false;

  public entityVersionModalData: {
    visible?: boolean,
    editIndex?: number,
    entityVersion?: MapSetEntityVersion
  } = {};

  @ViewChild("modalForm") public modalForm?: NgForm;

  public constructor(
    private mapSetService: MapSetService,
  ) { }

  public ngOnInit(): void {
    this.loadEntityVersionData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<MapSetEntityVersion>> {
    const q = copyDeep(this.query);
    q.mapSet = this.mapSetId!;
    q.mapSetVersion = this.mapSetVersion!;
    q.descriptionContains = this.searchInput || undefined;
    this.loading = true;
    return this.mapSetService.searchEntityVersions(this.mapSetId!, q).pipe(finalize(() => this.loading = false));
  }

  public loadEntityVersionData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public openEntityVersionModal(): void {
    this.entityVersionModalData.visible = true;
  }

  public closeEntityVersionModal(): void {
    this.entityVersionModalData = {};
  }

  public saveEntityVersionModal(): void {
    if (!validateForm(this.modalForm)) {
      return;
    }
    this.loading = true;
    this.mapSetService.linkEntityVersion(this.mapSetId!, this.mapSetVersion!, this.entityVersionModalData!.entityVersion!.id!).subscribe(() => {
      this.loadEntityVersionData();
      this.closeEntityVersionModal();
    }).add(() => this.loading = false);
  }

  public unlinkEntityVersion(entityVersionId: number): void {
    this.loading = true;
    this.mapSetService.unlinkEntityVersion(this.mapSetId!, this.mapSetVersion!, entityVersionId).subscribe(() =>
      this.loadEntityVersionData()).add(() => this.loading = false);
  }

}
