import {Clipboard} from '@angular/cdk/clipboard';
import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {isDefined} from '@kodality-web/core-util';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {environment} from 'environments/environment';
import {Fhir} from 'fhir/fhir';
import {saveAs} from 'file-saver';
import formatXml from 'xml-formatter';

@Component({
  templateUrl: './fhir-resource.component.html',
  styles: [`
    table, td, tr {
      border: 1px solid #d2d2d2;
    }
  `]
})
export class FhirResourceComponent implements OnInit {
  public meta?: {type?: string, id?: string, operation?: string, params?: ParamMap} = {};
  public error?: boolean;
  public result?: any;

  protected curl?: string;

  public constructor(
    protected http: HttpClient,
    private route: ActivatedRoute,
    private clipboardService: Clipboard,
    private oidcSecurityService: OidcSecurityService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      this.result = undefined;
      this.error = false;

      this.meta = {id: paramMap.get('id'), type: paramMap.get('type'), operation: paramMap.get('operation'), params: this.route.snapshot.queryParamMap};

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
    request.subscribe(r => this.result = r, err => {
      this.result = err;
      this.error = true;
    });
  }

  private loadResources(type: string): void {
    const url = `${environment.termxApi}/fhir/${type}`;
    this.composeCurl(url);
    const request = this.http.get<any>(url);
    request.subscribe(r => this.result = r, err => {
      this.result = err;
      this.error = true;
    });
  }

  private executeOperation(id: string, type: string, operation: string): void {
    const search = window.location.search.replace('_code', 'code');
    const url = `${environment.termxApi}/fhir/${type}/${id}/$${operation}` + search;
    this.composeCurl(url);
    const request = this.http.get<any>(url);
    request.subscribe(r => this.result = r, err => {
      this.result = err;
      this.error = true;
    });
  }

  public toXML = (resource: any): string => {
    return formatXml(new Fhir().jsonToXml(JSON.stringify(resource)));
  };

  protected downloadResult(resource: string, format?: 'xml' | 'json'): void {
    if (format === 'json') {
      saveAs(new Blob([JSON.stringify(resource, null, 2)], {type: 'application/json'}), `${this.meta.id}.json`);
    }
    if (format === 'xml') {
      saveAs(new Blob([this.toXML(resource)], {type: 'application/xml'}), `${this.meta.id}.xml`);
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
      l = window.location.origin + environment.baseHref + l.substring(1);
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

  protected narrativeType = (meta: {id: string, type: string, operation: string}): string => {
    if (meta && meta.type && !meta.operation) {
      return meta.type;
    }
    if (meta && meta.type === 'CodeSystem' && meta.operation === 'lookup') {
      return meta.type + '|' + meta.operation;
    }
    return undefined;
  };
}
