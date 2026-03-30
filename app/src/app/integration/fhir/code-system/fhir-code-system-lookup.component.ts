import {Clipboard} from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import {serializeDate} from '@termx-health/core-util';
import {FhirCodeSystemLibService, FhirCodeSystemLookupParams} from 'term-web/fhir/_lib';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiTextareaModule, MuiDatePickerModule, MuiAlertModule } from '@termx-health/ui';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './fhir-code-system-lookup.component.html',
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
    MuiDatePickerModule,
    MuiAlertModule,
    JsonPipe,
    TranslatePipe
],
})
export class FhirCodeSystemLookupComponent {
  private fhirCodeSystemLibService = inject(FhirCodeSystemLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;

  public data: {
    code?: string,
    system?: string,
    version?: string,
    date?: Date,
    propertyInput?: string,
    properties?: string[]
  } = {};

  public loading: boolean = false;

  public lookUp(): void {
    const sp = new FhirCodeSystemLookupParams();
    sp.code = this.data.code || undefined;
    sp.system = this.data.system || undefined;
    sp.version = this.data.version || undefined;
    sp.date = serializeDate(this.data.date);
    sp.properties = this.data.properties?.join(',');

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirCodeSystemLibService.lookup(sp).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public addProperty(): void {
    if (this.data.propertyInput) {
      this.data.properties = [...(this.data.properties || []), this.data.propertyInput];
      this.data.propertyInput = '';
    }
  }

  public removeProperty(index: number): void {
    this.data.properties?.splice(index, 1);
    this.data.properties = [...this.data.properties!];
    if (this.data.properties.length === 0) { this.data.properties = undefined; }
  }

  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
