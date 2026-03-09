import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {forkJoin, of} from 'rxjs';
import {ImplementationGuide, ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import {Provenance} from 'term-web/sys/_lib';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule } from '@kodality-web/marina-ui';
import { ProvenanceListComponent } from 'term-web/sys/_lib/provenance/components/provenance-list.component';

@Component({
    templateUrl: 'implementation-guide-provenances.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, ProvenanceListComponent]
})
export class ImplementationGuideProvenancesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private igService = inject(ImplementationGuideService);

  protected ig?: ImplementationGuide;
  protected version?: ImplementationGuideVersion;
  protected versions?: ImplementationGuideVersion[];
  protected provenances?: Provenance[];
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load', forkJoin([
      this.igService.load(id),
      version ? this.igService.loadVersion(id, version) : of(null),
      !version ? this.igService.searchVersions(id, {limit: -1}) : of(null),
      this.igService.loadProvenances(id, version)
    ])).subscribe(([ig, version, versions, provenances]) => {
        this.ig = ig;
        this.version = version;
        this.versions = versions?.data;
        this.provenances = provenances;
      });
  }
}
