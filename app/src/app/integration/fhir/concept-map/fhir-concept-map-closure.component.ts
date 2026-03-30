import {Clipboard} from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import {FhirConceptMapLibService, FhirParameters} from 'term-web/fhir/_lib';
import { MuiCardModule, MuiSpinnerModule, MuiButtonModule, MuiFormModule, MuiIconModule, MuiPopoverModule, MuiTextareaModule, MuiAlertModule } from '@termx-health/ui';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './fhir-concept-map-closure.component.html',
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
    TranslatePipe
],
})
export class FhirConceptMapClosureComponent {
  private fhirConceptMapService = inject(FhirConceptMapLibService);
  private clipboardService = inject(Clipboard);

  public response?: any;
  public error?: any;

  public data: {
    name?: string,
    version?: string,
    concepts?: {code?: string, system?: string}[],
  } = {};

  public conceptInput: {
    system?: string,
    code?: string
  } = {};


  public loading: boolean = false;

  public closure(): void {
    const p = new FhirParameters();
    p.parameter = [];
    p.parameter.push({name: 'name', valueString: this.data.name});
    if (this.data.version) {
      p.parameter.push({name: 'version', valueString: this.data.version});
    }
    if (this.data.concepts) {
      this.data.concepts.forEach(concept => {
        p.parameter!.push({name: 'concept', valueCoding: concept});
      });
    }

    this.loading = true;
    this.error = undefined;
    this.response = undefined;

    this.fhirConceptMapService.closure(p).subscribe({
      next: r => this.response = r,
      error: err => this.error = err.error
    }).add(() => this.loading = false);
  }

  public addConcept(): void {
    if (this.conceptInput) {
      this.data.concepts = [...(this.data.concepts || []), this.conceptInput];
      this.conceptInput = {};
    }
  }

  public removeConcept(index: number): void {
    this.data.concepts?.splice(index, 1);
    this.data.concepts = [...this.data.concepts!];
    if (this.data.concepts.length === 0) { this.data.concepts = undefined; }
  }


  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
