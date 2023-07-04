import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystem, CodeSystemVersion} from 'app/src/app/resources/_lib';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin} from 'rxjs';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {CodeSystemUnlinkedConceptsComponent} from 'term-web/resources/code-system/containers/summary/widgets/code-system-unlinked-concepts.component';

@Component({
  templateUrl: 'code-system-summary.component.html'
})
export class CodeSystemSummaryComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected versions?: CodeSystemVersion[];
  protected loader = new LoadingManager();

  @ViewChild(CodeSystemUnlinkedConceptsComponent) public unlinkedConceptsComponent?: CodeSystemUnlinkedConceptsComponent;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private codeSystemService: CodeSystemService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load',
      forkJoin([this.codeSystemService.load(id), this.codeSystemService.searchVersions(id, {limit: -1})]))
      .subscribe(([cs, versions]) => {
        this.codeSystem = cs;
        this.versions = versions.data;
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
}