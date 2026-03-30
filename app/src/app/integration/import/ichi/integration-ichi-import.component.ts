import { Component, inject } from '@angular/core';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiDatePickerModule, MuiMultiLanguageInputModule } from '@termx-health/ui';
import {Observable} from 'rxjs';
import {IntegrationIchiLibService, IntegrationImportConfiguration} from 'term-web/integration/_lib';
import {JobLogResponse} from 'term-web/sys/_lib';
import {IntegrationImportComponent} from 'term-web/integration/import/integration-import.component';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { FormsModule } from '@angular/forms';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-integration-ichi-import',
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
        TranslatePipe,
    ],
})
export class IntegrationIchiImportComponent extends IntegrationImportComponent {
  private integrationIchiLibService = inject(IntegrationIchiLibService);

  public breadcrumbs = ['web.integration.systems.ichi', 'web.integration.import.ichi'];

  public composeImportRequest(): Observable<JobLogResponse> {
    return this.integrationIchiLibService.import(this.data, this.data.sourceUrl!);
  }

  public setDefaultData(): void {
    this.data = IntegrationImportConfiguration.getIchiConfigurations();
  }
}
