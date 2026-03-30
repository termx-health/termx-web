import { Component, OnInit, inject } from '@angular/core';
import { copyDeep, SearchResult, AutofocusDirective, ApplyPipe } from '@termx-health/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {AssociationType, AssociationTypeSearchParams} from 'term-web/resources/_lib';
import {AssociationTypeService} from 'term-web/resources/association-type/services/association-type.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiIconModule, MuiDropdownModule, MuiPopconfirmModule, MuiFormModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    selector: 'tw-association-type-list',
    templateUrl: './association-type-list.component.html',
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
    MuiIconModule,
    MuiDropdownModule,
    MuiPopconfirmModule,
    MuiFormModule,
    MuiNoDataModule,
    TranslatePipe,
    ApplyPipe,
    HasAnyPrivilegePipe
],
})
export class AssociationTypeListComponent implements OnInit {
  private associationTypeService = inject(AssociationTypeService);

  public query = new AssociationTypeSearchParams();
  public searchResult: SearchResult<AssociationType> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<AssociationType>> {
    const q = copyDeep(this.query);
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.associationTypeService.search(q).pipe(finalize(() => {
      this.loading = false;
    }));
  }

  public onSearch = (): Observable<SearchResult<AssociationType>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public haveDescriptions(searchResult: SearchResult<AssociationType>): boolean {
    return searchResult.data.filter(at => at.description).length > 0;
  }

  public deleteAssociationType(code: string): void {
    this.associationTypeService.delete(code).subscribe(() => this.loadData());
  }
}
