import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {Template} from 'terminology-lib/thesaurus';
import {TemplateService} from '../../services/template.service';


@Component({
  templateUrl: 'template-edit.component.html'
})
export class TemplateEditComponent implements OnInit {
  public id?: number | null;
  public template?: Template;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.mode = this.id ? 'edit' : 'add';

    if (this.mode === 'add') {
      this.template = new Template();
      this.template.contentType = 'markdown';
      this.template.contents = [{lang: 'en'}, {lang: 'et'}];
    }

    if (this.mode === 'edit') {
      this.loading ['init'] = true;
      this.templateService.loadTemplate(this.id!).subscribe(t => this.template = t).add(() => this.loading ['init'] = false);
    }
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.templateService.saveTemplate(this.template!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public flagIcon(lang?: string): string | undefined {
    const getEmoji = (countryCode: string): string => {
      const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    };

    const langCountryMap: {[key: string]: string} = {'en': 'gb', 'et': 'ee'};
    return lang ? getEmoji(langCountryMap[lang] || lang) : undefined;
  }
}
