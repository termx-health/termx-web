import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {forkJoin} from 'rxjs';
import {Provenance, Release} from 'term-web/sys/_lib';
import {ReleaseService} from 'term-web/sys/release/services/release.service';
import { MarinPageLayoutModule, MuiCoreModule, MuiIconModule } from '@kodality-web/marina-ui';

import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { ProvenanceListComponent } from 'term-web/sys/_lib/provenance/components/provenance-list.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';

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
  `],
    imports: [MarinPageLayoutModule, MuiCoreModule, RouterLink, MuiIconModule, PrivilegedDirective, StatusTagComponent, ProvenanceListComponent, TranslatePipe, MarinaUtilModule]
})
export class ReleaseProvenancesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private releaseService = inject(ReleaseService);

  protected release?: Release;
  protected provenances?: Provenance[];
  protected loader = new LoadingManager();

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
