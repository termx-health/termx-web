import { Component, EventEmitter, Input, Output, ViewChild, OnInit, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {Router} from '@angular/router';
import { DestroyService, LoadingManager, validateForm, format, getDateFormat, JoinPipe, LocalDatePipe } from '@termx-health/core-util';
import { LocalizedName, MarinaUtilModule } from '@termx-health/util';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {NzSelectItemInterface} from 'ng-zorro-antd/select';
import {Release} from 'term-web/sys/_lib';
import {ReleaseService} from 'term-web/sys/release/services/release.service';
import {AuthService} from 'term-web/core/auth';
import { MuiModalModule, MarinPageLayoutModule, MuiFormModule, MuiSelectModule, MuiCoreModule, MuiButtonModule } from '@termx-health/ui';


@Component({
    selector: 'tw-resource-release-modal',
    templateUrl: './resource-release-modal-component.html',
    providers: [DestroyService],
    imports: [MuiModalModule, MarinPageLayoutModule, FormsModule, MuiFormModule, MuiSelectModule, MuiCoreModule, MuiButtonModule, TranslatePipe, MarinaUtilModule, JoinPipe, LocalDatePipe]
})
export class ResourceReleaseModalComponent implements OnInit {
  private releaseService = inject(ReleaseService);
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private authService = inject(AuthService);

  @Input() public resourceType: 'CodeSystem' | 'ValueSet' | 'MapSet';
  @Output() public connectedToRelease: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public releases: Release[];
  public params: {releaseId?: number, resourceId: string, resourceVersion: string, resourceTitle: LocalizedName};
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    if (this.authService.hasPrivilege('*.Release.view')) {
      this.loader.wrap('load', this.releaseService.search({status: 'draft', limit: 10_000})).subscribe(r => {
        this.releases = r.data;
      });
    }
  }

  public toggleModal(params?: any): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  public connectToRelease(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.releaseService.saveResource(this.params.releaseId, {
      resourceType: this.resourceType,
      resourceId: this.params.resourceId,
      resourceVersion: this.params.resourceVersion,
      resourceNames: this.params.resourceTitle
    })).subscribe(() => {
      this.connectedToRelease.emit(true);
      this.toggleModal();
    });
  }

  public filterOption = (_input: string, {nzValue}: NzSelectItemInterface): boolean => {
    const release = this.releases?.find(r => r.id === nzValue);
    return release?.code?.toLowerCase().includes(_input.toLowerCase()) ||
      Object.values(release?.names)?.filter(n => n?.toLowerCase()?.includes(_input.toLowerCase()))?.length > 0 ||
      release?.authors?.filter(a => a?.toLowerCase()?.includes(_input.toLowerCase()))?.length > 0 ||
      format(release?.planned, getDateFormat(this.translateService.currentLang))?.toLowerCase()?.includes(_input.toLowerCase()) ||
      format(release?.releaseDate, getDateFormat(this.translateService.currentLang))?.toLowerCase()?.includes(_input.toLowerCase());
  };

  public openReleaseManagement(): void {
    this.router.navigate(['/releases']);
  }
}
