import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {HttpClient} from '@angular/common/http';
import formatXml from 'xml-formatter';
import {isDefined} from '@kodality-web/core-util';

@Component({
  templateUrl: './fhir-resource.component.html',
  styles: [`
    table, td, tr {
      border: 1px solid #d2d2d2;
    }
  `]
})
export class FhirResourceComponent implements OnInit {
  public resource?: any;
  public operationResult?: any;

  public constructor(
    protected http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.resource = undefined;
      this.operationResult = undefined;

      const id = paramMap.get('id');
      const type = paramMap.get('type');
      const operation = paramMap.get('operation');

      if (isDefined(operation)) {
        this.executeOperation(id, type, operation);
        return;
      }

      this.loadResource(id, type);
    });
  }

  private loadResource(id: string, type: string): void {
    const request = this.http.get<any>(`${environment.termxApi}/fhir/${type}/${id}`);
    request.subscribe(r => this.resource = r);
  }

  public toXML = (resource: any): string => {
    return formatXml(new Fhir().jsonToXml(JSON.stringify(resource)));
  };

  public openCodeSystem(id: string): void {
    this.router.navigate(['/fhir/CodeSystem/', id]);
  }

  private executeOperation(id: string, type: string, operation: string): void {
    const search = window.location.search.replace('_code', 'code');
    const request = this.http.get<any>(`${environment.termxApi}/fhir/${type}/${id}/$${operation}` + search);
    request.subscribe(r => this.operationResult = r, err => this.operationResult = err);
  }
}
