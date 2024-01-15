import {Component, OnInit, ViewChild} from '@angular/core';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {Release, ReleaseResource} from 'term-web/sys/_lib';
import {ReleaseService} from 'term-web/sys/release/services/release.service';
import {forkJoin} from 'rxjs';
import {NgForm} from '@angular/forms';

@Component({
  templateUrl: 'release-summary.component.html',
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
export class ReleaseSummaryComponent implements OnInit {
  protected release?: Release;
  protected resources?: ReleaseResource[];
  protected loader = new LoadingManager();
  protected showOnlyOpenedTasks: boolean;
  protected modalData: {visible?: boolean, resource?: ReleaseResource} = {resource: new ReleaseResource()};
  protected mode: 'summary' | 'provenance' = 'summary';

  public constructor(
    private route: ActivatedRoute,
    private releaseService: ReleaseService
  ) {}

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadData(Number(id));
  }

  protected loadData(id: number): void {
    this.loader.wrap('load', forkJoin([
      this.releaseService.load(id),
      this.releaseService.loadResources(id)]))
      .subscribe(([release, resources]) => {
        this.release = release;
        this.resources = resources;
      });
  }

  public saveResource(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save-resource', this.releaseService.saveResource(this.release.id, this.modalData.resource))
      .subscribe(() => {
        this.modalData = {resource: new ReleaseResource()};
        this.loadData(this.release.id);
      });
  }

  protected deleteResource(id: number): void {
    this.loader.wrap('delete-resource', this.releaseService.deleteResource(this.release.id, id))
      .subscribe(() => this.loadData(this.release.id));
  }

  protected changeStatus(status: 'draft' | 'active' | 'retired'): void {
    this.loader.wrap('change-status', this.releaseService.changeStatus(this.release.id, status))
      .subscribe(() => this.loadData(this.release.id));
  }
}
