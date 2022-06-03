import {CodeSystemEntityVersion} from 'terminology-lib/resources';
import {debounceTime, distinctUntilChanged, finalize, Observable, Subject, switchMap} from 'rxjs';
import {copyDeep, SearchResult} from '@kodality-web/core-util';
import {CodeSystemService} from '../../services/code-system.service';
import {Component, Input, OnInit} from '@angular/core';
import {CodeSystemEntityVersionQueryParams} from 'terminology-lib/resources/codesystem/model/code-system-entity-version-search-params';

@Component({
  selector: 'twa-code-system-version-entities-list',
  templateUrl: './code-system-version-entities-list.component.html',
})
export class CodeSystemVersionEntitiesListComponent implements OnInit {
  @Input() public codeSystemId?: string;
  @Input() public versionId?: number;
  @Input() public version?: string;

  public searchResult = new SearchResult<CodeSystemEntityVersion>();
  public query = new CodeSystemEntityVersionQueryParams();
  public loading = false;
  public modalVisible = false;

  public modalData?: CodeSystemEntityVersion;
  public searchInput: string = "";
  public searchUpdate = new Subject<string>();

  public constructor(private codeSystemService: CodeSystemService) { }

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<CodeSystemEntityVersion>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.loading = true;
    return this.codeSystemService.searchEntityVersionsByCodeSystemVersion(this.codeSystemId!, this.version!, q).pipe(finalize(() => this.loading = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public delete(index: number): void {
    this.codeSystemService.deleteCodeSystemEntityVersion(this.codeSystemId!, this.version!, this.searchResult.data[index]).subscribe(() => this.loadData());
  }

  public save(): void {
    if (this.modalData) {
      this.codeSystemService.addCodeSystemEntityVersion(this.codeSystemId!, this.version!, this.modalData).subscribe(() => {
        this.loadData();
        this.modalVisible = !this.modalVisible;
      });
    }
  }
}
