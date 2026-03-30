import { Component, OnInit, inject } from '@angular/core';
import { copyDeep, SearchResult, AutofocusDirective } from '@termx-health/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {Template, TemplateSearchParams} from 'term-web/wiki/_lib';
import {TemplateService} from 'term-web/wiki/template/template.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiDropdownModule, MuiIconModule, MuiNoDataModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    templateUrl: 'template-list.component.html',
    imports: [MuiCardModule, MuiInputModule, InputDebounceDirective, AutofocusDirective, FormsModule, PrivilegedDirective, AddButtonComponent, RouterLink, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiDropdownModule, MuiIconModule, MuiNoDataModule, TranslatePipe, MarinaUtilModule, HasAnyPrivilegePipe]
})
export class TemplateListComponent implements OnInit {
  private templateService = inject(TemplateService);

  public query = new TemplateSearchParams();
  public searchResult: SearchResult<Template> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Template>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.loading = true;
    return this.templateService.searchTemplates(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Template>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public deleteTemplate(id: number): void {
    this.templateService.deleteTemplate(id).subscribe(() => this.loadData());
  }
}
