import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, QueryParams, SearchResult, AutofocusDirective } from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {MeasurementUnit, MeasurementUnitSearchParams} from 'term-web/measurement-unit/_lib';
import {MeasurementUnitService} from 'term-web/measurement-unit/services/measurement-unit.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiNoDataModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    templateUrl: './measurement-unit-list.component.html',
    imports: [
        MuiCardModule,
        MuiInputModule,
        InputDebounceDirective,
        AutofocusDirective,
        FormsModule,
        PrivilegedDirective,
        AddButtonComponent,
        RouterLink,
        MuiBackendTableModule,
        MuiTableModule,
        MuiCoreModule,
        MuiNoDataModule,
        TranslatePipe,
        MarinaUtilModule,
        HasAnyPrivilegePipe,
    ],
})
export class MeasurementUnitListComponent implements OnInit {
  private measurementUnitService = inject(MeasurementUnitService);
  private stateStore = inject(ComponentStateStore);

  protected readonly STORE_KEY = 'measurement-unit-list';

  public query = new MeasurementUnitSearchParams();
  public searchResult: SearchResult<MeasurementUnit> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<MeasurementUnit>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput || undefined;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.measurementUnitService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<MeasurementUnit>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };
}
