import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import {FhirValueSetLibService} from 'term-web/fhir/_lib';

@Component({
  templateUrl: './fhir-value-set.component.html',
  styles:  [`
    table, td, tr {
      border: 1px solid #d2d2d2;
    }
  `]
})
export class FhirValueSetComponent implements OnInit {
  public valueSet?: any;

  public constructor(
    private valueSetService: FhirValueSetLibService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadValueSet(id!);
  }

  private loadValueSet(id: string): void {
    this.valueSetService.expandValueSet(id).subscribe(v => this.valueSet = v);
  }

  public openJson(): void {
    window.open(environment.terminologyApi + '/fhir/ValueSet/' + this.valueSet.id, '_blank');
  }

  public exportXml(): void {
    const xml = new Fhir().jsonToXml(this.valueSet);
    saveAs(new Blob([xml], {type: 'application/xml'}), `${this.valueSet.id}.xml`);
  }

  public getDisplays(designations: any[]): any[] {
    return designations.filter(d => d.use.code === 'display');
  }

  public getDefinitions(designations: any[]): any[] {
    return designations.filter(d => d.use.code === 'definition');
  }

  public openCodeSystem(id: string): void {
    this.router.navigate(['/fhir/CodeSystem/', id]);
  }
}
