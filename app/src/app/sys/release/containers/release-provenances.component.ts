import {Component, OnInit} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {Provenance, Release} from 'term-web/sys/_lib';
import {ReleaseService} from 'term-web/sys/release/services/release.service';

@Component({
  templateUrl: 'release-provenances.component.html',
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
export class ReleaseProvenancesComponent implements OnInit {
  protected release?: Release;
  protected provenances?: Provenance[];
  protected loader = new LoadingManager();

  public constructor(
    private route: ActivatedRoute,
    private releaseService: ReleaseService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load', forkJoin([
      this.releaseService.load(Number(id)),
      this.releaseService.loadProvenances(Number(id))
    ])).subscribe(([r, provenances]) => {
        this.release = r;
        this.provenances = provenances;
      });
  }
}
