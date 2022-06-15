import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FhirCodeSystemLibService, FhirCodeSystemLookupParams} from 'lib/src/fhir';
import {serializeDate} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ClipboardService} from 'ngx-clipboard';


@Component({
  templateUrl: './fhir-code-system-lookup.component.html',
})
export class FhirCodeSystemLookupComponent implements OnInit {
  public source?: string | null;
  public loading: boolean = false;

  public property?: string;

  public input: {
    code?: string,
    system?: string,
    version?: string,
    date?: Date,
    properties?: string[]
  } = {};

  public result?: any;
  public issues: string[] = [];

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private integrationFhirService: FhirCodeSystemLibService,
    private clipboardService: ClipboardService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.source = queryParamMap.get('source');
    });

  }

  public lookUp(): void {
    const sp = new FhirCodeSystemLookupParams();
    sp.code = this.input.code;
    sp.system = this.input.system;
    sp.version = this.input.version;
    sp.date = serializeDate(this.input.date);
    sp.properties = this.input.properties?.join(',');

    this.loading = true;
    this.issues = [];

    this.integrationFhirService.lookup(sp).subscribe(r => this.result = r, error => {
      error.error.issue.forEach((issue: {details: {text: string;};}) => this.issues.push(issue.details.text));
      return this.result = error;
    }).add(() => this.loading = false);
  }

  public addProperty(): void {
    if (this.property) {
      this.input.properties = [...(this.input.properties || []), this.property];
      this.property = '';
    }
  }

  public removeProperty(index: number): void {
    this.input.properties?.splice(index, 1);
    this.input.properties = [...this.input.properties!];
  }

  public copyResult(): void { /*TODO add ngx-clipboard to utils*/
    this.clipboardService.copy(JSON.stringify(this.result));
  }
}
