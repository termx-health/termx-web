import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, QueryParams, SearchResult, AutofocusDirective } from '@termx-health/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {Sequence} from 'term-web/sequence/_lib/models/sequence';
import {SequenceSearchParams} from 'term-web/sequence/_lib/models/sequence-search-params';
import {SequenceLibService} from 'term-web/sequence/_lib/services/sequence-lib.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'sequence-list.component.html',
    imports: [MuiCardModule, MuiInputModule, InputDebounceDirective, AutofocusDirective, FormsModule, AddButtonComponent, RouterLink, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiNoDataModule, TranslatePipe]
})
export class SequenceListComponent implements OnInit {
  private sequenceService = inject(SequenceLibService);
  private stateStore = inject(ComponentStateStore);

  protected readonly STORE_KEY = 'sequence-list';

  public query: SequenceSearchParams;
  public searchResult: SearchResult<Sequence> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    } else {
      this.query = new SequenceSearchParams();
      this.query.sort = 'code';
    }

    this.loadData();
  }

  private search(): Observable<SearchResult<Sequence>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.sequenceService.search(q).pipe(finalize(() => this.loading = false));
  }

  protected onSearch = (): Observable<SearchResult<Sequence>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }
}
