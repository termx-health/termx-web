import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {LocalizedName} from '@kodality-web/marina-util';
import {TranslateService} from '@ngx-translate/core';
import slugify from 'slugify';
import {forkJoin} from 'rxjs';
import {MapSetService} from '../../map-set/services/map-set-service';
import {CodeSystemService} from '../../code-system/services/code-system.service';
import {MapSet} from 'term-web/resources/_lib';


@Component({
  templateUrl: 'dev-map-set-edit.component.html'
})
export class DevMapSetEditComponent implements OnInit {
  public mapSetId?: string | null;

  public mapSet?: MapSet;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private translateService: TranslateService,
    private mapSetService: MapSetService,
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    this.mode = this.mapSetId ? 'edit' : 'add';

    if (this.mode === 'add') {
      this.mapSet = new MapSet();
      this.mapSet.names = {};
      this.mapSet.versions = [{status: 'draft', version: '1'}];
    }

    if (this.mode === 'edit') {
      this.loading ['init'] = true;
      this.mapSetService.load(this.mapSetId!, true).subscribe(ms => this.mapSet = ms).add(() => this.loading ['init'] = false);
    }
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.mapSetService.saveTransaction({
      mapSet: this.mapSet!,
      version: this.mapSet!.versions?.[0]!,
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
      this.mapSet!.id = slugify(n);
    }
  }

  public publisherChanged(publisher: string): void {
    if (this.mode !== 'add' || !publisher) {
      return;
    }
    forkJoin([
      this.codeSystemService.searchProperties('publisher', {names: 'uri'}),
      this.codeSystemService.loadConcept('publisher', publisher)
    ]).subscribe(([prop, c]) => {
      const activeVersion = c.versions?.find(v => v.status === 'active');
      if (activeVersion) {
        const uri = activeVersion.propertyValues?.find(pv => prop.data.map(p => p.id).includes(pv.entityPropertyId))?.value;
        this.mapSet!.uri = uri && this.mapSet!.id ? uri + '/MapSet/' + this.mapSet!.id : this.mapSet!.uri;
      }
    });
  }
}
