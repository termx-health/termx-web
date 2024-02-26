import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemVersion} from 'app/src/app/resources/_lib';
import {forkJoin} from 'rxjs';
import {CodeSystemUnlinkedConceptsComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-unlinked-concepts.component';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {ResourceTasksWidgetComponent} from 'term-web/resources/resource/components/resource-tasks-widget.component';

@Component({
  templateUrl: 'code-system-summary.component.html'
})
export class CodeSystemSummaryComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected versions?: CodeSystemVersion[];
  protected showOnlyOpenedTasks?: boolean = true;
  protected loader = new LoadingManager();

  @ViewChild(CodeSystemUnlinkedConceptsComponent) public unlinkedConceptsComponent?: CodeSystemUnlinkedConceptsComponent;
  @ViewChild(ResourceTasksWidgetComponent) public tasksWidgetComponent?: ResourceTasksWidgetComponent;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id= pm.get('id');
      this.loadData(id);
    });
  }

  public openVersionSummary(version: string): void {
    this.router.navigate(['/resources/code-systems', this.codeSystem.id, 'versions', version, 'summary']);
  }

  public link(codeSystemVersion: string, entityVersionIds: number[]): void {
    this.loader.wrap('link', this.codeSystemService.linkEntityVersions(this.codeSystem.id, codeSystemVersion, entityVersionIds))
      .subscribe(() => {
        this.codeSystemService.searchVersions(this.codeSystem.id, {limit: -1}).subscribe(versions => this.versions = versions.data);
        this.unlinkedConceptsComponent.loadUnlinkedConcepts();
      });
  }

  protected filterDraftVersions = (v: CodeSystemVersion): boolean => {
    return v.status === 'draft';
  };

  protected loadData(id: string): void {
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(id), this.codeSystemService.searchVersions(id, {limit: -1})]))
      .subscribe(([cs, versions]) => {
        this.codeSystem = cs;
        this.versions = versions.data;
      });
  }
}
