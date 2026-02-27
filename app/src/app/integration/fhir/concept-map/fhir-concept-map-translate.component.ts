import {Clipboard} from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import {FhirConceptMapLibService, FhirConceptMapTranslateParams} from 'term-web/fhir/_lib';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiTextareaModule, MuiAlertModule } from '@kodality-web/marina-ui';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './fhir-concept-map-translate.component.html',
    imports: [
        MuiCardModule,
        MuiSpinnerModule,
        NzBreadCrumbComponent,
        NzBreadCrumbItemComponent,
        MuiButtonModule,
        MuiFormModule,
        MuiIconModule,
        MuiPopoverModule,
        MuiTextareaModule,
        FormsModule,
        MuiAlertModule,
        JsonPipe,
        TranslatePipe,
    ],
})
export class FhirConceptMapTranslateComponent {
  private fhirConceptMapLibService = inject(FhirConceptMapLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;

  public data = new FhirConceptMapTranslateParams();

  public loading: boolean = false;

  public translate(): void {
    this.data.uri = this.data.uri || undefined;
    this.data.conceptMapVersion = this.data.conceptMapVersion || undefined;
    this.data.code = this.data.code || undefined;
    this.data.system = this.data.system || undefined;
    this.data.version = this.data.version || undefined;
    this.data.targetSystem = this.data.targetSystem || undefined;

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirConceptMapLibService.translate(this.data).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
