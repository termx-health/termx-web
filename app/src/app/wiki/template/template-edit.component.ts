import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { copyDeep, isDefined, LoadingManager, validateForm, AutofocusDirective, ApplyPipe } from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {Template, TemplateContent} from 'term-web/wiki/_lib';
import {TemplateService} from 'term-web/wiki/template/template.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiInputModule, MuiMultiLanguageInputModule, MuiTextareaModule, MuiDropdownModule, MuiButtonModule, MuiCoreModule } from '@kodality-web/marina-ui';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'template-edit.component.html',
    imports: [MuiFormModule, MuiSpinnerModule, MuiCardModule, AutofocusDirective, FormsModule, MuiInputModule, MuiMultiLanguageInputModule, MuiTextareaModule, MuiDropdownModule, MuiButtonModule, MuiCoreModule, TranslateDirective, TranslatePipe, ApplyPipe]
})
export class TemplateEditComponent implements OnInit {
  private templateService = inject(TemplateService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  protected id?: number;
  protected template?: Template;

  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

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
