import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {FhirCodeSystemLibService, FhirValueSetLibService} from 'term-web/fhir/_lib';

@Component({
  templateUrl: './fhir-code-system.component.html',
  styles:  [`
    table, td, tr {
      border: 1px solid #d2d2d2;
    }
  `]
})
export class FhirCodeSystemComponent implements OnInit {
  public codeSystem?: any;
  public valueSetUsages?: any[];

  public constructor(
    private codeSystemService: FhirCodeSystemLibService,
    private valueSetService: FhirValueSetLibService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadCodeSystem(id!);
  }

  private loadCodeSystem(id: string): void {
    this.codeSystemService.loadCodeSystem(id).subscribe(cs => {
      this.codeSystem = cs;
      this.loadValueSetUsages(cs.url!);
    });
  }

  public openJson(): void {
    window.open(environment.terminologyApi + '/fhir/CodeSystem/' + this.codeSystem.id, '_blank');
  }

  public exportXml(): void {
    const xml = new Fhir().jsonToXml(this.codeSystem);
    saveAs(new Blob([xml], {type: 'application/xml'}), `${this.codeSystem.id}.xml`);
  }

  private loadValueSetUsages(uri: string): void {
    this.valueSetService.search({reference: uri}).subscribe(v => this.valueSetUsages = v.entry);
  }

  public getDisplays(designations: any[]): any[] {
    return designations.filter(d => d.use.code === 'display');
  }

  public getDefinitions(designations: any[]): any[] {
    return designations.filter(d => d.use.code === 'definition');
  }

  public getProperties(properties: any[], code: string): any[] {
    return properties.filter(p => p.code === code);
  }

  public getPropertyValue(properties: any[]): any {
    return properties?.map(p => p.valueString || p.valueInteger || p.valueDecimal || p.valueBoolean || p.valueCoding?.code).join(',');
  }

  public openValueSet(id: string): void {
    this.router.navigate(['/fhir/ValueSet/', id]);
  }
}
