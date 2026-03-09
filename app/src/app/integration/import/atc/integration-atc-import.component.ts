import { Component, inject } from '@angular/core';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiDatePickerModule, MuiMultiLanguageInputModule } from '@kodality-web/marina-ui';
import {Observable} from 'rxjs';
import {IntegrationAtcLibService, IntegrationImportConfiguration} from 'term-web/integration/_lib';
import {JobLogResponse} from 'term-web/sys/_lib';
import {IntegrationImportComponent} from 'term-web/integration/import/integration-import.component';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';

import { FormsModule } from '@angular/forms';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-integration-atc-import',
    templateUrl: '../integration-import.component.html',
    imports: [
    MuiCardModule,
    MuiSpinnerModule,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    MuiButtonModule,
    MuiFormModule,
    MuiInputModule,
    FormsModule,
    MuiDatePickerModule,
    CodeSystemSearchComponent,
    MuiMultiLanguageInputModule,
    TranslatePipe
],
})
export class IntegrationAtcImportComponent extends IntegrationImportComponent {
  private integrationAtcLibService = inject(IntegrationAtcLibService);

  public breadcrumbs = ['web.integration.systems.atc', 'web.integration.import.atc'];

  public composeImportRequest(): Observable<JobLogResponse> {
    return this.integrationAtcLibService.import(this.data, this.edition!, this.data.sourceUrl);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getDefaultAtcConfigurations(this.edition!);
  }
}
