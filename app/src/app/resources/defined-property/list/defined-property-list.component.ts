import { Component, OnInit, inject } from '@angular/core';
import { ComponentStateStore, copyDeep, DestroyService, LoadingManager, QueryParams, SearchResult, AutofocusDirective } from '@termx-health/core-util';
import {Observable, tap} from 'rxjs';
import {DefinedProperty, DefinedPropertySearchParams} from 'term-web/resources/_lib';
import {DefinedPropertyService} from 'term-web/resources/defined-property/services/defined-property.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiIconModule, MuiTooltipModule, MuiDropdownModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: './defined-property-list.component.html',
    providers: [DestroyService],
    imports: [MuiCardModule, MuiInputModule, InputDebounceDirective, AutofocusDirective, FormsModule, PrivilegedDirective, AddButtonComponent, RouterLink, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiIconModule, MuiTooltipModule, MuiDropdownModule, MuiNoDataModule, TranslatePipe, MarinaUtilModule, PrivilegedPipe]
})
export class DefinedPropertyListComponent implements OnInit {
  private definedEntityPropertyService = inject(DefinedPropertyService);
  private stateStore = inject(ComponentStateStore);

  protected query = new DefinedPropertySearchParams();
  protected searchResult: SearchResult<DefinedProperty> = SearchResult.empty();
  protected searchInput: string;
  protected loader = new LoadingManager();

  protected readonly STORE_KEY = 'defined-entity-property-list';

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }
    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<DefinedProperty>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    return this.loader.wrap('load', this.definedEntityPropertyService.search(q));
  }

  protected onSearch = (): Observable<SearchResult<DefinedProperty>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public updateRelatedProperties(id: number): void {
    this.loader.wrap('load', this.definedEntityPropertyService.updateRelated(id)).subscribe();
  }
}
