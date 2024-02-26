import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ComponentStateStore, copyDeep, DestroyService, QueryParams, SearchResult} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {finalize, Observable, tap} from 'rxjs';
import {Space, SpaceSearchParams} from 'term-web/space/_lib';
import {JobLibService} from 'term-web/sys/_lib';
import {SpaceService} from '../../services/space.service';

@Component({
  templateUrl: './space-list.component.html',
  providers: [DestroyService]
})
export class SpaceListComponent implements OnInit {
  public query = new SpaceSearchParams();
  public searchResult: SearchResult<Space> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;
  public importing: boolean;

  protected readonly STORE_KEY = 'space-list';

  @ViewChild('importSpace') public importFileInput: ElementRef;

  public constructor(
    private spaceService: SpaceService,
    private jobService: JobLibService,
    private notificationService: MuiNotificationService,
    private destroy$: DestroyService,
    private stateStore: ComponentStateStore,
  ) { }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.searchInput = this.query.textContains;
    }

    this.loadData();
  }

  public loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  private search(): Observable<SearchResult<Space>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.spaceService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Space>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  public touchImport(): void {
    this.importFileInput.nativeElement.click();
  }

  public import(event: any): void {
    const file = event.target.files[0];
    if (!!file) {
      this.importing = true;
      this.spaceService.import(file).subscribe({
        next: (resp) => this.pollJobStatus(resp.jobId as number),
        error: () => this.importing = false
      });
    }
  }

  private pollJobStatus(jobId: number): void {
    this.jobService.pollFinishedJobLog(jobId, this.destroy$).subscribe(jobResp => {
      if (!jobResp.errors) {
        this.notificationService.success("web.space.import-success-message");
        this.loadData();
      } else {
        this.notificationService.error("web.space.import-error-message", jobResp.errors.join(","), {duration: 0, closable: true});
      }
    }).add(() => this.importing = false);
  }
}
