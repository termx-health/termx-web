import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ComponentStateStore} from '@kodality-web/core-util';
import {SnomedBranch, SnomedLibService, SnomedSearchComponent} from 'term-web/integration/_lib';

@Component({
  templateUrl: './snomed-dashboard.component.html',
  styles: [`
    @import "../../../../styles/variables";
    @space-context-bg: var(--color-action-bar-background);
    .context-container {
      display: grid;
      grid-template-columns: auto 1fr min-content min-content;
      background: @space-context-bg;
      overflow: auto;
    }
    .context-item {
      display: flex;
      gap: .5rem;
      height: 100%;
      padding: 1rem 2rem;
      border-bottom: @mui-border;
      white-space: nowrap;
    }
  `]
})
export class SnomedDashboardComponent implements OnInit {
  public conceptId?: string;
  @ViewChild("searchComponent") public searchComponent?: SnomedSearchComponent;

  protected branch?: string = 'MAIN';
  protected branches?: SnomedBranch[];

  protected readonly STORE_KEY = 'snomed-management-branch';

  public constructor(private route: ActivatedRoute, private router: Router, private stateStore: ComponentStateStore, private snomedService: SnomedLibService) {}

  public ngOnInit(): void {
    const branch = this.stateStore.pop(this.STORE_KEY);
    if (branch) {
      this.branch = branch;
    }

    this.initData();
    this.route.paramMap.subscribe(pm => {
      this.conceptId = pm.get("conceptId") || this.conceptId;
      this.searchComponent?.expandTree(this.conceptId);
    });
  }

  public conceptSelected(conceptId: string): void {
    this.conceptId = conceptId;
    const tab = this.route.snapshot.queryParamMap.get("tab");
    this.router.navigate(['/integration/snomed/dashboard', conceptId], {queryParams: {tab: tab}});
  }

  private initData(): void {
    this.snomedService.loadBranches().subscribe(branches => {
      this.branches = branches;
    });
  }

  public changeBranch(path: string): void {
    this.stateStore.put(this.STORE_KEY, path);
    this.branch = path;
  }
}
