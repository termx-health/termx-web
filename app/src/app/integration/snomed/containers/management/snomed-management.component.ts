import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { LoadingManager, validateForm, ApplyPipe, LocalDatePipe, LocalDateTimePipe, ValuesPipe } from '@termx-health/core-util';
import { MuiTableComponent, MuiCardModule, MarinPageLayoutModule, MuiTableModule, MuiIconButtonModule, MuiCoreModule, MuiNoDataModule, MuiCheckboxModule, MuiModalModule, MuiFormModule, MuiTextareaModule, MuiButtonModule } from '@termx-health/ui';
import {SnomedBranch, SnomedCodeSystem} from 'term-web/integration/_lib';
import {SnomedService} from 'term-web/integration/snomed/services/snomed-service';
import {forkJoin} from 'rxjs';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: './snomed-management.component.html',
    imports: [
    MuiCardModule,
    MarinPageLayoutModule,
    PrivilegedDirective,
    AddButtonComponent,
    MuiTableModule,
    MuiIconButtonModule,
    MuiCoreModule,
    RouterLink,
    MuiNoDataModule,
    NgTemplateOutlet,
    MuiCheckboxModule,
    FormsModule,
    MuiModalModule,
    MuiFormModule,
    MuiTextareaModule,
    MuiButtonModule,
    TranslatePipe,
    ApplyPipe,
    LocalDatePipe,
    LocalDateTimePipe,
    ValuesPipe,
    PrivilegedPipe
],
})
export class SnomedManagementComponent implements OnInit {
  private snomedService = inject(SnomedService);

  protected workingBranches: SnomedBranch[] = [];
  protected dailyBuildBranches: SnomedBranch[] = [];
  protected codeSystems: SnomedCodeSystem[] = [];
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;
  @ViewChild("csTable") public table?: MuiTableComponent<SnomedCodeSystem>;


  public editionModalData: {
    visible?: boolean,
    countryCode?: string
    name?: string
  } = {};

  public ngOnInit(): void {
    this.loadData();
  }

  protected encodeUriComponent = (c: string): string => {
    return c.split('/').join('--');
  };

  protected createCodeSystem(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const cs: SnomedCodeSystem = {
      shortName: 'SNOMEDCT-' + this.editionModalData.countryCode,
      branchPath: 'MAIN/SNOMEDCT-' + this.editionModalData.countryCode,
      name: this.editionModalData.name
    };
    this.loader.wrap('load', this.snomedService.createCodeSystem(cs)).subscribe(() => {
      this.editionModalData = {};
      this.loadData();
    });
  }

  private loadData(): void {
    this.loader.wrap('load', forkJoin([
        this.snomedService.loadBranches(),
        this.snomedService.loadCodeSystems()
    ])).subscribe(([branches, codeSystems]) =>{
      this.codeSystems = codeSystems;
      this.workingBranches = branches.filter(b => !codeSystems.find(cs => cs.branchPath == b.path || !!cs.versions.find(v => v.branchPath === b.path)));
      this.dailyBuildBranches = branches.filter(b => !!codeSystems.find(cs => cs.branchPath == b.path && cs.dailyBuildAvailable));
    });
  }
}
