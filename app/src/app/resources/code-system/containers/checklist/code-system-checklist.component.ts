import { Component, OnInit, ViewChild, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {forkJoin, of} from 'rxjs';
import {CodeSystem, CodeSystemLibService, CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemChecklistConfigurationComponent} from 'term-web/resources/code-system/containers/checklist/code-system-checklist-configuration.component';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiRadioModule, MuiCoreModule, MuiDividerModule, MuiButtonModule } from '@termx-health/ui';
import { FormsModule } from '@angular/forms';

import { CodeSystemChecklistValidationComponent } from 'term-web/resources/code-system/containers/checklist/code-system-checklist-validation.component';
import { CodeSystemChecklistConfigurationComponent as CodeSystemChecklistConfigurationComponent_1 } from 'term-web/resources/code-system/containers/checklist/code-system-checklist-configuration.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'code-system-checklist.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, MuiRadioModule, FormsModule, MuiCoreModule, MuiDividerModule, MuiButtonModule, CodeSystemChecklistValidationComponent, CodeSystemChecklistConfigurationComponent_1, TranslatePipe]
})
export class CodeSystemChecklistComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private codeSystemService = inject(CodeSystemLibService);

  protected codeSystem?: CodeSystem;
  protected version?: CodeSystemVersion;
  protected versions?: CodeSystemVersion[];
  protected loader = new LoadingManager();

  protected mode: 'validation' | 'configuration' = 'validation';
  protected emptyConfiguration: boolean = false;
  protected validationShowAll: boolean = true;

  @ViewChild(CodeSystemChecklistConfigurationComponent) public configurationComponent?: CodeSystemChecklistConfigurationComponent;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loader.wrap('load', forkJoin([
      this.codeSystemService.load(id),
      version ? this.codeSystemService.loadVersion(id, version) : of(null),
      !version ? this.codeSystemService.searchVersions(id, {limit: -1}) : of(null)
    ])).subscribe(([cs, version, versions]) => {
      this.codeSystem = cs;
      this.version = version;
      this.versions = versions?.data;
    });
  }

  public saveConfiguration(): void {
    this.configurationComponent?.save();
    this.emptyConfiguration = false;
  }
}
