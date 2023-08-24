import {Component, OnInit} from '@angular/core';
import {ValueSet, ValueSetVersion, ValueSetVersionConcept} from 'app/src/app/resources/_lib';
import {DestroyService, LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {forkJoin} from 'rxjs';
import {JobLibService} from 'app/src/app/sys/_lib';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Component({
  templateUrl: 'value-set-version-concepts.component.html',
  providers: [DestroyService]
})
export class ValueSetVersionConceptsComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected valueSetVersion?: ValueSetVersion;
  protected loader = new LoadingManager();

  protected searchInput: string;

  public constructor(
    private route: ActivatedRoute,
    private valueSetService: ValueSetService,
    private notificationService: MuiNotificationService,
    private jobService: JobLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  public filterExpansion = (expansion: ValueSetVersionConcept[], text: string): ValueSetVersionConcept[] => {
    if (!text) {
      return expansion;
    }
    return expansion.filter(e => e.concept?.code?.includes(text) || e.display?.name?.includes(text) || !!e.additionalDesignations?.find(d => d.name?.includes(text)));
  };

  protected reloadExpansion(): void {
    if (this.valueSetVersion.status != 'draft') {
      this.notificationService.warning('web.value-set-version.summary.expansion-warning');
      return;
    }
    this.loader.wrap('expand', this.valueSetService.expandAsync({valueSet: this.valueSet.id, valueSetVersion: this.valueSetVersion.version})).subscribe(job => {
      this.pollJobStatus(job.jobId);
    });
  }

  private pollJobStatus(jobId: number): void {
    this.loader.wrap('expand', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(jobResp => {
      this.loadData(this.valueSet.id, this.valueSetVersion.version);
    });
  }

  private loadData(valueSet: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([
        this.valueSetService.load(valueSet),
        this.valueSetService.loadVersion(valueSet, versionCode)
      ])).subscribe(([vs, vsv]) => {
      this.valueSet = vs;
      this.valueSetVersion = vsv;
    });
  }
}
