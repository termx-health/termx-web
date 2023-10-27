import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {HttpClient} from '@angular/common/http';
import formatXml from 'xml-formatter';
import {isDefined} from '@kodality-web/core-util';
import {Clipboard} from '@angular/cdk/clipboard';
import {saveAs} from 'file-saver';
import {OidcSecurityService} from 'angular-auth-oidc-client';

@Component({
  templateUrl: './fhir-resource.component.html',
  styles: [`
    table, td, tr {
      border: 1px solid #d2d2d2;
    }
  `]
})
export class FhirResourceComponent implements OnInit {
  public meta?: {type?: string, id?: string, operation?: string} = {};
  public resource?: any;
  public operationResult?: any;

  protected curl?: string;

  public constructor(
    protected http: HttpClient,
    private route: ActivatedRoute,
    private clipboardService: Clipboard,
    private oidcSecurityService: OidcSecurityService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.resource = undefined;
      this.operationResult = undefined;

      this.meta = {id: paramMap.get('id'), type: paramMap.get('type'), operation: paramMap.get('operation')};

      if (isDefined(this.meta.operation)) {
        this.executeOperation(this.meta.id, this.meta.type, this.meta.operation);
      } else if (isDefined(this.meta.id)) {
        this.loadResource(this.meta.id, this.meta.type);
      } else {
        this.loadResources(this.meta.type);
      }
    });
  }

  private loadResource(id: string, type: string): void {
    const url = `${environment.termxApi}/fhir/${type}/${id}`;
    this.composeCurl(url);
    const request = this.http.get<any>(url);
    request.subscribe(r => this.resource = r);
  }

  private loadResources(type: string): void {
    const url = `${environment.termxApi}/fhir/${type}`;
    this.composeCurl(url);
    const request = this.http.get<any>(url);
    request.subscribe(r => this.operationResult = r);
  }

  private executeOperation(id: string, type: string, operation: string): void {
    const search = window.location.search.replace('_code', 'code');
    const url = `${environment.termxApi}/fhir/${type}/${id}/$${operation}` + search;
    this.composeCurl(url);
    const request = this.http.get<any>(url);
    request.subscribe(r => this.operationResult = r, err => this.operationResult = err);
  }

  public toXML = (resource: any): string => {
    return formatXml(new Fhir().jsonToXml(JSON.stringify(resource)));
  };

  protected downloadResult(resource: string, format?: 'xml' | 'json'): void {
    if (format === 'json') {
      saveAs(new Blob([JSON.stringify(resource, null, 2)], {type: 'application/json'}), `${this.resource.id}.json`);
    }
    if (format === 'xml') {
      saveAs(new Blob([this.toXML(resource)], {type: 'application/xml'}), `${this.resource.id}.xml`);
    }
  }

  protected copyResult(resource: string, format?: 'xml' | 'json'): void {
    if (format === 'xml') {
      resource = this.toXML(resource);
    }
    this.clipboardService.copy(JSON.stringify(resource, null, 2));
  }

  private composeCurl(l: string): void {
    if (l.startsWith('/')) {
      l = window.location.origin + l;
    }
    this.oidcSecurityService.getAccessToken().subscribe(token => {
      this.curl =  '```\n' +'curl --location \'' + l + '\'' +
        (isDefined(token) ? ' \\\n' + '--header \'Authorization: Bearer ' + token + '\'' : '');
    });
  }

  protected addAcceptHeader = (curl: string, format: string): string => {
    return curl + ' \\\n' +
      '--header \'Accept: application/fhir+' + format + '\'\n' + '```\n';
  };
}
