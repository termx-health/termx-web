import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ComponentStateStore, copyDeep, LoadingManager, QueryParams, SearchResult, LocalDateTimePipe } from '@kodality-web/core-util';
import {Observable, tap} from 'rxjs';
import {TransformationDefinition} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {TransformationDefinitionQueryParams} from 'term-web/modeler/_lib/transformer/transformation-definition-query.params';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiPopconfirmModule, MuiPopoverModule, MuiDropdownModule, MuiIconModule, MuiNoDataModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';

import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: './transformation-definition-list.component.html',
    imports: [
    MuiCardModule,
    MuiInputModule,
    InputDebounceDirective,
    FormsModule,
    PrivilegedDirective,
    AddButtonComponent,
    RouterLink,
    MuiBackendTableModule,
    MuiTableModule,
    MuiCoreModule,
    MuiPopconfirmModule,
    MuiPopoverModule,
    MuiDropdownModule,
    MuiIconModule,
    MuiNoDataModule,
    TranslatePipe,
    LocalDateTimePipe,
    PrivilegedPipe
],
})
export class TransformationDefinitionListComponent implements OnInit {
  private transformationDefinitionService = inject(TransformationDefinitionService);
  private stateStore = inject(ComponentStateStore);
  private router = inject(Router);

  protected readonly STORE_KEY = 'transformation-definition-list';

  protected query = new TransformationDefinitionQueryParams();
  protected searchResult = SearchResult.empty<TransformationDefinition>();
  protected loader = new LoadingManager();

  public constructor() {
    this.query.summary = true;
    this.query.sort = '-modified';
  }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
    }

    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<TransformationDefinition>> {
    const q = copyDeep(this.query);
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('search', this.transformationDefinitionService.search(q));
  }

  protected onSearch = (): Observable<SearchResult<TransformationDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected duplicateDefinition(id: number): void {
    this.loader.wrap('duplicate', this.transformationDefinitionService.duplicate(id)).subscribe(td => {
      this.router.navigate(['/modeler/transformation-definitions', td.id, 'edit']);
    });
  }
}
