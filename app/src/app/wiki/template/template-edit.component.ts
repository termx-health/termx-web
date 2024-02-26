import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Template, TemplateContent} from 'term-web/wiki/_lib';
import {TemplateService} from './template.service';


@Component({
  templateUrl: 'template-edit.component.html'
})
export class TemplateEditComponent implements OnInit {
  protected id?: number;
  protected template?: Template;

  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

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
      this.template.contents = [{lang: environment.defaultLanguage}];
    }

    if (this.mode === 'edit') {
      this.loader.wrap('init', this.templateService.loadTemplate(this.id)).subscribe(t => this.template = t);
    }
  }

  protected save(): void {
    if (!this.validate()) {
      return;
    }
    const t = copyDeep(this.template);
    t.contents = t.contents.filter(c => c.content.trim()?.length);
    this.loader.wrap('save', this.templateService.saveTemplate(t)).subscribe(() => {
      this.location.back();
    });
  }

  protected validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  protected addLanguageContent(lang: string): void {
    this.template.contents = [...this.template.contents, {lang}];
  }

  protected availableLangs = (contents: TemplateContent[]): string[] => {
    const current = contents?.map(c => c.lang) ?? [];
    return environment.contentLanguages.filter(k => !current.includes(k));
  };
}
