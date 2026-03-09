import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {DefinedProperty} from 'term-web/resources/_lib';
import {DefinedPropertyService} from 'term-web/resources/defined-property/services/defined-property.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiSelectModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './defined-property-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    FormsModule,
    MuiTextareaModule,
    MuiMultiLanguageInputModule,
    MuiSelectModule,
    ValueSetConceptSelectComponent,
    MuiButtonModule,
    TranslatePipe
],
})
export class DefinedPropertyEditComponent implements OnInit {
  private definedEntityPropertyService = inject(DefinedPropertyService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  protected entityProperty?: DefinedProperty;
  protected mode: 'add' | 'edit' = 'add';
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.mode = id ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadEntityProperty(Number(id));
    } else {
      this.entityProperty = this.writeEntityProperty(new DefinedProperty());
    }
  }

  private loadEntityProperty(id: number): void {
    this.loader.wrap('load', this.definedEntityPropertyService.load(id)).subscribe(ep => this.entityProperty = this.writeEntityProperty(ep));
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.definedEntityPropertyService.save(this.entityProperty)).subscribe(() => this.location.back());
  }

  private writeEntityProperty(ep: DefinedProperty): DefinedProperty {
    ep.rule ??= {};
    return ep;
  }
}

