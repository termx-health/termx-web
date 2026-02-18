import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DestroyService, LoadingManager, LocalDatePipe } from '@kodality-web/core-util';
import { MuiNotificationService, MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, MuiIconModule, MuiDividerModule, MuiNoDataModule, MuiDropdownModule, MuiCoreModule } from '@kodality-web/marina-ui';
import {AssociationType, AssociationTypeLibService, MapSet, MapSetAutomapRequest, MapSetVersion} from 'term-web/resources/_lib';
import {forkJoin, map} from 'rxjs';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {JobLibService} from 'term-web/sys/_lib';
import {AuthService} from 'term-web/core/auth';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { NgClass, AsyncPipe } from '@angular/common';
import { MapSetVersionInfoWidgetComponent } from 'term-web/resources/map-set/containers/version/summary/widgets/map-set-version-info-widget.component';
import { MapSetSourceConceptListComponent } from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-source-concept-list.component';
import { MapSetExternalSourceConceptListComponent } from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-external-source-concept-list.component';
import { MapSetAssociationListComponent } from 'term-web/resources/map-set/containers/version/summary/assoociations/map-set-association-list.component';
import { MapSetUnmappedConceptListComponent } from 'term-web/resources/map-set/containers/version/summary/concepts/map-set-unmapped-concept-list.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'map-set-version-summary.component.html',
    providers: [DestroyService],
    imports: [ResourceContextComponent, MarinPageLayoutModule, MuiFormModule, MuiCardModule, MuiButtonModule, RouterLink, MuiIconModule, MapSetVersionInfoWidgetComponent, MuiDividerModule, MuiNoDataModule, NgClass, MuiDropdownModule, MuiCoreModule, MapSetSourceConceptListComponent, MapSetExternalSourceConceptListComponent, MapSetAssociationListComponent, MapSetUnmappedConceptListComponent, AsyncPipe, TranslatePipe, LocalDatePipe]
})
export class MapSetVersionSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private notificationService = inject(MuiNotificationService);
  private mapSetService = inject(MapSetService);
  private jobService = inject(JobLibService);
  private associationTypeService = inject(AssociationTypeLibService);
  private destroy$ = inject(DestroyService);
  private authService = inject(AuthService);

  protected mapSet?: MapSet;
  protected mapSetVersion?: MapSetVersion;
  protected loader = new LoadingManager();

  protected selectedStatistics: string = 'source-concepts';
  protected associationTypes: AssociationType[];

  protected isAuthenticated = this.authService.isAuthenticated.pipe(
    map(isAuth => isAuth)
  );

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
    this.loader.wrap('reload-statistics', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(() => {
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
