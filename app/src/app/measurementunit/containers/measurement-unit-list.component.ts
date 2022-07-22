import {Component, OnInit} from '@angular/core';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {MeasurementUnit, MeasurementUnitSearchParams} from 'terminology-lib/measurementunit';
import {MeasurementUnitService} from '../services/measurement-unit.service';

@Component({
  templateUrl: './measurement-unit-list.component.html',
})
export class MeasurementUnitListComponent implements OnInit {
  public query = new MeasurementUnitSearchParams();
  public searchInput?: string;
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<MeasurementUnit> = SearchResult.empty();
  public loading = false;

  public constructor(
    private measurementUnitService: MeasurementUnitService,
  ) {}

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }


  private search(): Observable<SearchResult<MeasurementUnit>> {
    const q = copyDeep(this.query);
    q.kind = this.searchInput;
    this.loading = true;
    return this.measurementUnitService.search(q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

}
