import { Location } from '@angular/common';
import { Component, Directive, OnInit, ViewChild, inject } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NgForm, ValidationErrors, Validator, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { LoadingManager, unique, validateForm, AutofocusDirective } from '@kodality-web/core-util';
import {Sequence} from 'term-web/sequence/_lib/models/sequence';
import {SequenceService} from 'term-web/sequence/services/sequence.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiInputModule, MuiSelectModule, MuiNumberInputModule, MuiTableModule, MuiNoDataModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';

const getInvalidCodeChars = (v: string): string[] => v?.match(/[^\w-]/gm)?.filter(unique) || [];

@Directive({
    selector: '[twInvalidSequenceCode]',
    providers: [{ provide: NG_VALIDATORS, useExisting: InvalidSequenceCodeValidatorDirective, multi: true }]
})
export class InvalidSequenceCodeValidatorDirective implements Validator {
  public validate(control: AbstractControl): ValidationErrors | null {
    const chars = getInvalidCodeChars(control.value);
    return chars.length ? {sequenceInvalidCharacters: chars} : null;
  }
}

@Component({
    templateUrl: 'sequence-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    FormsModule,
    MuiInputModule,
    AutofocusDirective,
    InvalidSequenceCodeValidatorDirective,
    MuiSelectModule,
    MuiNumberInputModule,
    MuiTableModule,
    MuiNoDataModule,
    MuiButtonModule,
    TranslatePipe
],
})
export class SequenceEditComponent implements OnInit {
  private sequenceService = inject(SequenceService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  protected sequence?: Sequence;
  protected loader = new LoadingManager();

  @ViewChild(NgForm) public form?: NgForm;

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSequence(Number(id));
    } else {
      this.sequence = new Sequence();
      this.sequence.restart = 'yearly';
      this.sequence.startFrom = 0;
    }
  }

  private loadSequence(id: number): void {
    this.loader.wrap('load', this.sequenceService.load(id)).subscribe(resp => this.sequence = resp);
  }

  protected save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.sequenceService.save(this.sequence)).subscribe(() => this.location.back());
  }

  protected get isLoading(): boolean {
    return this.loader.isLoadingExcept('save');
  }
}
