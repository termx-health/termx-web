import { Component, OnInit, inject } from '@angular/core';
import { copyDeep, SearchResult, AutofocusDirective } from '@kodality-web/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {StructureDefinition, StructureDefinitionSearchParams} from 'term-web/modeler/_lib';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiDropdownModule, MuiPopconfirmModule, MuiIconModule, MuiNoDataModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    templateUrl: 'structure-definition-list.component.html',
    imports: [MuiCardModule, MuiInputModule, InputDebounceDirective, AutofocusDirective, FormsModule, PrivilegedDirective, AddButtonComponent, RouterLink, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiDropdownModule, MuiPopconfirmModule, MuiIconModule, MuiNoDataModule, TranslatePipe, HasAnyPrivilegePipe]
})
export class StructureDefinitionListComponent implements OnInit {
  private structureDefinitionService = inject(StructureDefinitionService);

  public query = new StructureDefinitionSearchParams();
  public searchResult: SearchResult<StructureDefinition> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<StructureDefinition>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.loading = true;
    return this.structureDefinitionService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<StructureDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public deleteStructureDefinition(id: number): void {
    this.structureDefinitionService.delete(id).subscribe(() => this.loadData());
  }
}
