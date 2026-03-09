import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { isDefined, LoadingManager, validateForm, IncludesPipe } from '@kodality-web/core-util';
import {TerminologyServerLibService, TerminologyServer} from 'term-web/sys/_lib/space';
import {Release} from 'term-web/sys/_lib';
import {ReleaseService} from 'term-web/sys/release/services/release.service';
import { MuiSpinnerModule, MuiCardModule, MuiFormModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiDatePickerModule, MuiSelectModule, MuiTagModule, MuiIconModule, MuiInputModule, MuiButtonModule } from '@kodality-web/marina-ui';

import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';


@Component({
    templateUrl: 'release-edit.component.html',
    imports: [MuiSpinnerModule, FormsModule, MuiCardModule, MuiFormModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiDatePickerModule, MuiSelectModule, MuiTagModule, MuiIconModule, MuiInputModule, AddButtonComponent, MuiButtonModule, TranslatePipe, MarinaUtilModule, IncludesPipe]
})
export class ReleaseEditComponent implements OnInit {
  private releaseService = inject(ReleaseService);
  private terminologyServerService = inject(TerminologyServerLibService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected release?: Release;
  protected newAuthor?: string;
  protected terminologyServers?: TerminologyServer[];
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.loadData();
    this.route.paramMap.subscribe(paramMap => {

      const id = paramMap.get('id');
      if (isDefined(id)) {
        this.mode = 'edit';
        this.loader.wrap('load', this.releaseService.load(Number(id))).subscribe(r => this.release = this.writeRelease(r));
      }
      this.release = this.writeRelease(new Release());
    });
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loader.wrap('save', this.releaseService.save(this.release))
      .subscribe(r => this.router.navigate(['/releases', r.id, 'summary']));
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public addAuthor(): void {
    this.release.authors = [...this.release.authors, this.newAuthor];
    this.newAuthor = undefined;
  }

  public deleteAuthor(author: string): void {
    const index = this.release.authors.indexOf(author);
    if (index !== -1) {
      this.release.authors.splice(index, 1);
    }
    this.newAuthor = undefined;
  }

  private writeRelease(r: Release): Release {
    r.authors ??= [];
    return r;
  }

  private loadData(): void {
    this.loader.wrap('data', this.terminologyServerService.search({limit: -1}))
      .subscribe(r => this.terminologyServers = r.data);
  }
}
