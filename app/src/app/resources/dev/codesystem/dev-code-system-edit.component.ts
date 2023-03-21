import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {CodeSystem} from 'term-web/resources/_lib';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemService} from '../../codesystem/services/code-system.service';
import {LocalizedName} from '@kodality-web/marina-util';
import {TranslateService} from '@ngx-translate/core';
import slugify from 'slugify';
import {forkJoin} from 'rxjs';
import {DevCodeSystemRelationsComponent} from './dev-code-system-relations.component';
import {DevCodeSystemPropertiesComponent} from './dev-code-system-properties.component';


@Component({
  templateUrl: 'dev-code-system-edit.component.html'
})
export class DevCodeSystemEditComponent implements OnInit {
  public codeSystemId?: string | null;

  public codeSystem?: CodeSystem;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild("relationsComponent") public relationsComponent?: DevCodeSystemRelationsComponent;
  @ViewChild("propertiesComponent") public propertiesComponent?: DevCodeSystemPropertiesComponent;

  public constructor(
    private translateService: TranslateService,
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = this.codeSystemId ? 'edit' : 'add';

    if (this.mode === 'add') {
      this.codeSystem = new CodeSystem();
      this.codeSystem.content = 'complete';
      this.codeSystem.names = {};
      this.codeSystem.versions = [{status: 'draft', version: '1'}];
    }

    if (this.mode === 'edit') {
      this.loading ['init'] = true;
      this.codeSystemService.load(this.codeSystemId!, true).subscribe(cs => this.codeSystem = cs).add(() => this.loading ['init'] = false);
    }
  }

  public save(): void {
    if (!this.validate() ||
      (this.relationsComponent && !this.relationsComponent.valid()) ||
      (this.propertiesComponent && !this.propertiesComponent.valid())) {
      return;
    }
    this.loading['save'] = true;
    this.codeSystemService.saveTransaction({
      codeSystem: this.codeSystem!,
      properties: this.propertiesComponent?.getProperties(),
      version: this.codeSystem!.versions?.[0],
      valueSet: this.relationsComponent?.geValueSet()
    }).subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public nameChanged(name: LocalizedName): void {
    if (this.mode !== 'add' || !name) {
      return;
    }
    const names = Object.values(name);
    const n  = name[this.translateService.currentLang] ? name[this.translateService.currentLang] : names.length > 0 ? names[0] : undefined;
    if (n) {
      this.codeSystem!.id = slugify(n);
    }
  }

  public publisherChanged(publisher: string): void {
    if (this.mode !== 'add' || !publisher) {
      return;
    }
    forkJoin([
      this.codeSystemService.searchProperties('publisher', {name: 'uri'}),
      this.codeSystemService.loadConcept('publisher', publisher)
    ]).subscribe(([prop, c]) => {
      const activeVersion = c.versions?.find(v => v.status === 'active');
      if (activeVersion) {
        const uri = activeVersion.propertyValues?.find(pv => prop.data.map(p => p.id).includes(pv.entityPropertyId))?.value;
        this.codeSystem!.uri = uri && this.codeSystem!.id ? uri + '/CodeSystem/' + this.codeSystem!.id : this.codeSystem!.uri;
      }
    });
  }
}
