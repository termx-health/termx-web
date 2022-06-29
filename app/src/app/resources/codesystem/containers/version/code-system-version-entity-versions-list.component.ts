import {CodeSystemEntityVersion, CodeSystemEntityVersionQueryParams} from 'terminology-lib/resources';
import {debounceTime, distinctUntilChanged, finalize, Observable, of, Subject, switchMap} from 'rxjs';
import {BooleanInput, copyDeep, SearchResult, validateForm} from '@kodality-web/core-util';
import {CodeSystemService} from '../../services/code-system.service';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';


@Component({
  selector: 'twa-code-system-version-entity-version-list',
  templateUrl: './code-system-version-entity-versions-list.component.html',
})
export class CodeSystemVersionEntityVersionsListComponent implements OnInit {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public codeSystemId?: string;
  @Input() public version?: string;

  @ViewChild("form") public form?: NgForm;

  public loading: {[key: string]: boolean} = {};
  public modalVisible = false;
  public modalData?: CodeSystemEntityVersion;

  public query = new CodeSystemEntityVersionQueryParams();
  public searchInput: string = "";
  public searchUpdate = new Subject<string>();
  public searchResult: SearchResult<CodeSystemEntityVersion> = SearchResult.empty();


  public constructor(
    private codeSystemService: CodeSystemService
  ) { }

  public ngOnInit(): void {
    this.loadData();
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(() => this.search()),
    ).subscribe(data => this.searchResult = data);
  }

  private search(): Observable<SearchResult<CodeSystemEntityVersion>> {
    if (!this.codeSystemId) {
      return of(this.searchResult);
    }
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    q.codeSystem = this.codeSystemId;
    q.codeSystemVersion = this.version;
    this.loading['search'] = true;
    return this.codeSystemService.searchEntityVersions(this.codeSystemId, q).pipe(finalize(() => this.loading['search'] = false));
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.codeSystemService.linkEntityVersion(this.codeSystemId!, this.version!, this.modalData!.id!).subscribe(() => {
      this.loadData();
      this.modalVisible = false;
    }).add(() => this.loading['save'] = false);
  }

  public delete(entity: CodeSystemEntityVersion): void {
    this.codeSystemService.unlinkEntityVersion(this.codeSystemId!, this.version!, entity.id!).subscribe(() => this.loadData());
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
