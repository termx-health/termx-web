import {Component} from '@angular/core';
import {FhirParameters} from 'terminology-lib/fhir';
import {ClipboardService} from '@kodality-web/core-util';
import {FhirConceptMapLibService} from 'terminology-lib/fhir';


@Component({
  templateUrl: './fhir-concept-map-closure.component.html',
})
export class FhirConceptMapClosureComponent {
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

  public constructor(
    private fhirConceptMapService: FhirConceptMapLibService,
    private clipboardService: ClipboardService,
  ) {}

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
    this.data.concepts.length === 0 ? this.data.concepts = undefined : '';
  }


  public copyResult(): void {
    this.clipboardService.copy(JSON.stringify(this.response || this.error));
  }
}
