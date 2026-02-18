import { Component, OnInit, inject } from '@angular/core';
import { copyDeep, SearchResult, AutofocusDirective } from '@kodality-web/core-util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {finalize, Observable, tap} from 'rxjs';
import {NamingSystem, NamingSystemSearchParams} from 'term-web/resources/_lib';
import {NamingSystemService} from 'term-web/resources/naming-system/services/naming-system-service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiDropdownModule, MuiPopconfirmModule, MuiIconModule, MuiFormModule, MuiNoDataModule } from '@kodality-web/marina-ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';

import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { MarinaUtilModule } from '@kodality-web/marina-util';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';


@Component({
    selector: 'tw-naming-system-list',
    templateUrl: './naming-system-list.component.html',
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
    StatusTagComponent,
    MuiDropdownModule,
    MuiPopconfirmModule,
    MuiIconModule,
    MuiFormModule,
    MuiNoDataModule,
    TranslatePipe,
    MarinaUtilModule,
    HasAnyPrivilegePipe
],
})
export class NamingSystemListComponent implements OnInit {
  private namingSystemService = inject(NamingSystemService);
  private translateService = inject(TranslateService);

  public query = new NamingSystemSearchParams();
  public searchResult: SearchResult<NamingSystem> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<NamingSystem>> {
    const q = copyDeep(this.query);
    q.lang = this.translateService.currentLang;
    q.textContains = this.searchInput;
    this.loading = true;
    return this.namingSystemService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<NamingSystem>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };


  public retire(ns: NamingSystem): void {
    this.loading = true;
    this.namingSystemService.retire(ns.id!).subscribe(() => ns.status = 'retired').add(() => this.loading = false);
  }

  public activate(ns: NamingSystem): void {
    this.loading = true;
    this.namingSystemService.activate(ns.id!).subscribe(() => ns.status = 'active').add(() => this.loading = false);
  }

  public deleteNamingSystem(namingSystemId: string): void {
    this.namingSystemService.delete(namingSystemId).subscribe(() => this.loadData());
  }
}
