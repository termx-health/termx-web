import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {validateForm} from '@termx-health/core-util';
import {NamingSystem, NamingSystemIdentifier} from 'term-web/resources/_lib';
import {NamingSystemService} from 'term-web/resources/naming-system/services/naming-system-service';
import {NamingSystemIdentifierFormComponent} from 'term-web/resources/naming-system/containers/edit/naming-system-identifier-form.component';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiInputModule, MuiButtonModule } from '@termx-health/ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './naming-system-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    StatusTagComponent,
    FormsModule,
    MuiTextareaModule,
    MuiMultiLanguageInputModule,
    ValueSetConceptSelectComponent,
    CodeSystemSearchComponent,
    MuiInputModule,
    NamingSystemIdentifierFormComponent,
    MuiButtonModule,
    TranslatePipe
],
})
export class NamingSystemEditComponent implements OnInit {
  private namingSystemService = inject(NamingSystemService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  public namingSystem?: NamingSystem;

  public loading: {[k: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild("identifiers") public identifiers?: NamingSystemIdentifierFormComponent;

  public ngOnInit(): void {
    const namingSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = namingSystemId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadNamingSystem(namingSystemId!);
    } else {
      this.namingSystem = new NamingSystem();
      this.namingSystem.status = 'draft';
      this.namingSystem.identifiers = [new NamingSystemIdentifier()];
    }
  }

  private loadNamingSystem(id: string): void {
    this.loading['init'] = true;
    this.namingSystemService.load(id).subscribe(ns => this.namingSystem = ns).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (![validateForm(this.form), this.identifiers?.validate()].every(Boolean)) {
      return;
    }
    this.loading['save'] = true;
    this.namingSystemService.save(this.namingSystem!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}

