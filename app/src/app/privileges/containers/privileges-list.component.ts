import { Component, OnInit, inject } from '@angular/core';
import { copyDeep, SearchResult, collect, sortFn, AutofocusDirective, ApplyPipe, KeysPipe } from '@termx-health/core-util';
import {finalize, Observable, tap} from 'rxjs';
import {Privilege, PrivilegeResourceActions, PrivilegeSearchParams, PrivilegeResource} from 'term-web/privileges/_lib';
import {PrivilegeService} from 'term-web/privileges/services/privilege.service';
import { MuiCardModule, MuiInputModule, MuiBackendTableModule, MuiTableModule, MuiCoreModule, MuiNoDataModule, MuiAbbreviateModule } from '@termx-health/ui';
import { InputDebounceDirective } from 'term-web/core/ui/directives/input-debounce.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@termx-health/util';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    templateUrl: './privileges-list.component.html',
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
    NgTemplateOutlet,
    MuiNoDataModule,
    MuiAbbreviateModule,
    TranslatePipe,
    MarinaUtilModule,
    ApplyPipe,
    KeysPipe,
    HasAnyPrivilegePipe
],
})
export class PrivilegesListComponent implements OnInit {
  private privilegeService = inject(PrivilegeService);

  public query = new PrivilegeSearchParams();
  public searchResult: SearchResult<Privilege> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Privilege>> {
    const q = copyDeep(this.query);
    q.codeContains = this.searchInput;
    this.loading = true;
    return this.privilegeService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Privilege>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public toPlainString = (actions: PrivilegeResourceActions): string => {
    if (!actions) {
      return '';
    }
    return Object.keys(actions).filter(key => !!(actions as any)[key]).join(', ');
  };

  protected collectResourcesByType = (resources: PrivilegeResource[]): {[k: string]: PrivilegeResource[]} => {
    return collect(resources.sort(sortFn('resourceType')), r => r.resourceType);
  };
}
