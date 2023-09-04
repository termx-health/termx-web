import {Component, OnInit} from '@angular/core';
import {AssociationType, AssociationTypeLibService, MapSet, MapSetAutomapRequest, MapSetVersion} from 'app/src/app/resources/_lib';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {JobLibService} from 'term-web/sys/_lib';

@Component({
  templateUrl: 'map-set-version-summary.component.html',
  providers: [DestroyService]
})
export class MapSetVersionSummaryComponent implements OnInit {
  protected mapSet?: MapSet;
  protected mapSetVersion?: MapSetVersion;
  protected loader = new LoadingManager();

  protected selectedStatistics: string = 'source-concepts';
  protected associationTypes: AssociationType[];

  public constructor(
    private route: ActivatedRoute,
    private notificationService: MuiNotificationService,
    private mapSetService: MapSetService,
    private jobService: JobLibService,
    private associationTypeService: AssociationTypeLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);

    this.associationTypeService.search({associationKinds: 'concept-map-equivalence', limit: -1})
      .subscribe(r => this.associationTypes = r.data);
  }

  protected loadData(mapSet: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([this.mapSetService.load(mapSet), this.mapSetService.loadVersion(mapSet, versionCode)])
    ).subscribe(([ms, msv]) => {
      this.mapSet = ms;
      this.mapSetVersion = msv;
    });
  }

  protected reloadStatistics(): void {
    if (this.mapSetVersion.status != 'draft') {
      this.notificationService.warning('web.map-set-version.summary.statistics-warning');
      return;
    }
    this.loader.wrap('reload-statistics', this.mapSetService.reloadStatistics(this.mapSet.id, this.mapSetVersion.version)).subscribe(job => {
      this.pollJobStatus(job.jobId);
    });
  }

  private pollJobStatus(jobId: number): void {
    this.loader.wrap('reload-statistics', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(jobResp => {
      this.loadData(this.mapSet.id, this.mapSetVersion.version);
    });
  }

  protected automap(mappingType: 'code' | 'designation' | 'code-designation'): void {
    const req: MapSetAutomapRequest = {
      mapByCode: mappingType.includes('code'),
      mapByDesignation: mappingType.includes('designation')
    };
    this.loader.wrap('automap', this.mapSetService.automapAssociations(this.mapSet.id, this.mapSetVersion.version, req)).subscribe(job => {
      this.pollJobStatus(job.jobId);
    });
  }
}
