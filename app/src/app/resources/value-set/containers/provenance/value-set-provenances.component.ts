import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {forkJoin, of} from 'rxjs';
import {ValueSet, ValueSetLibService, ValueSetVersion} from 'term-web/resources/_lib';
import {Provenance} from 'term-web/sys/_lib';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule } from '@termx-health/ui';
import { ProvenanceListComponent } from 'term-web/sys/_lib/provenance/components/provenance-list.component';

@Component({
    templateUrl: 'value-set-provenances.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, ProvenanceListComponent]
})
export class ValueSetProvenancesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private valueSetService = inject(ValueSetLibService);

  protected valueSet?: ValueSet;
  protected version: ValueSetVersion;
  protected versions?: ValueSetVersion[];
  protected provenances?: Provenance[];
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load', forkJoin([
      this.valueSetService.load(id),
      version ? this.valueSetService.loadVersion(id, version) : of(null),
      !version ? this.valueSetService.searchVersions(id, {limit: -1}) : of(null),
      this.valueSetService.loadProvenances(id, version)
    ])).subscribe(([vs, version, versions, provenances]) => {
        this.valueSet = vs;
        this.version = version;
        this.versions = versions?.data;
        this.provenances = provenances;
      });
  }
}
