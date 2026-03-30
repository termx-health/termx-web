import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { DestroyService, LoadingManager, ApplyPipe, LocalDatePipe } from '@termx-health/core-util';
import { MuiNotificationService, MuiCardModule, MuiInputModule, MuiIconModule, MuiDividerModule, MuiButtonModule, MuiTableModule, MuiPopoverModule, MuiNoDataModule } from '@termx-health/ui';
import {ValueSet, ValueSetVersion, ValueSetVersionConcept} from 'term-web/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {JobLibService} from 'term-web/sys/_lib';
import {AuthService} from 'term-web/core/auth';
import {forkJoin, map} from 'rxjs';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LocalizedConceptNamePipe } from 'term-web/resources/_lib/code-system/pipe/localized-concept-name-pipe';
import { CodeSystemCodingReferenceComponent } from 'term-web/resources/code-system/components/code-system-coding-reference.component';
import { EntityProperty } from 'term-web/resources/_lib';

@Component({
    templateUrl: 'value-set-version-concepts.component.html',
    providers: [DestroyService],
    imports: [ResourceContextComponent, MuiCardModule, MuiInputModule, FormsModule, MuiIconModule, MuiDividerModule, MuiButtonModule, MuiTableModule, MuiPopoverModule, MuiNoDataModule, AsyncPipe, TranslatePipe, ApplyPipe, LocalDatePipe, LocalizedConceptNamePipe, CodeSystemCodingReferenceComponent]
})
export class ValueSetVersionConceptsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private valueSetService = inject(ValueSetService);
  private notificationService = inject(MuiNotificationService);
  private jobService = inject(JobLibService);
  private destroy$ = inject(DestroyService);
  private authService = inject(AuthService);

  protected valueSet?: ValueSet;
  protected valueSetVersion?: ValueSetVersion;
  protected loader = new LoadingManager();

  protected searchInput: string;
  protected conceptReferenceProperty: EntityProperty = {type: 'Coding'};

  protected isAuthenticated = this.authService.isAuthenticated.pipe(
    map(isAuth => isAuth)
  );

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  public filterExpansion = (expansion: ValueSetVersionConcept[], text: string): ValueSetVersionConcept[] => {
    if (!text) {
      return expansion;
    }
    return expansion.filter(e =>
      e.concept?.code?.toLowerCase().includes(text.toLowerCase()) ||
      e.display?.name?.toLowerCase().includes(text.toLowerCase()) ||
      !!e.additionalDesignations?.find(d => d.name?.toLowerCase().includes(text.toLowerCase()))
    );
  };

  protected conceptReferenceValue = (item: ValueSetVersionConcept): {code?: string, codeSystem?: string} => {
    return {
      code: item?.concept?.code,
      codeSystem: item?.concept?.codeSystem
    };
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
    this.loader.wrap('expand', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(() => {
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
