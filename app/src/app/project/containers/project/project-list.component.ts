import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {finalize, Observable, tap} from 'rxjs';
import {ComponentStateStore, copyDeep, DestroyService, QueryParams, SearchResult} from '@kodality-web/core-util';
import {ProjectService} from '../../services/project.service';
import {Project, ProjectSearchParams} from 'term-web/project/_lib';
import {JobLibService} from 'term-web/sys/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Component({
  templateUrl: './project-list.component.html',
  providers: [DestroyService]
})
export class ProjectListComponent implements OnInit {
  public query = new ProjectSearchParams();
  public searchResult: SearchResult<Project> = SearchResult.empty();
  public searchInput: string;
  public loading: boolean;
  public importing: boolean;

  protected readonly STORE_KEY = 'project-list';

  @ViewChild('importProject') public importFileInput: ElementRef;

  public constructor(
    private projectService: ProjectService,
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

  private search(): Observable<SearchResult<Project>> {
    const q = copyDeep(this.query);
    q.textContains = this.searchInput;
    this.stateStore.put(this.STORE_KEY, {query: q});

    this.loading = true;
    return this.projectService.search(q).pipe(finalize(() => this.loading = false));
  }

  public onSearch = (): Observable<SearchResult<Project>> => {
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
      this.projectService.import(file).subscribe({
        next: (resp) => this.pollJobStatus(resp.jobId as number),
        error: () => this.importing = false
      });
    }
  }

  private pollJobStatus(jobId: number): void {
    this.jobService.pollFinishedJobLog(jobId, this.destroy$).subscribe(jobResp => {
      if (!jobResp.errors) {
        this.notificationService.success("web.project.import-success-message");
        this.loadData();
      } else {
        this.notificationService.error("web.project.import-error-message", jobResp.errors.join(","), {duration: 0, closable: true});
      }
    }).add(() => this.importing = false);
  }
}
