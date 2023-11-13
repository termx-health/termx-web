import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {ImplementationGuide, ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';

@Component({
  templateUrl: 'implementation-guide-summary.component.html'
})
export class ImplementationGuideSummaryComponent implements OnInit {
  protected ig?: ImplementationGuide;
  protected versions?: ImplementationGuideVersion[];
  protected showOnlyOpenedTasks?: boolean = true;
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private igService: ImplementationGuideService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadData(id);
  }

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/code-systems', this.ig.id, 'versions', version, 'summary']);
  }

  protected loadData(id: string): void {
    this.loader.wrap('load',
      forkJoin([this.igService.load(id), this.igService.searchVersions(id, {limit: -1})]))
      .subscribe(([ig, versions]) => {
        this.ig = ig;
        this.versions = versions.data;
      });
  }
}
