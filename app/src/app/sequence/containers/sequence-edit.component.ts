import {Location} from '@angular/common';
import {Component, Directive, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, NgForm, ValidationErrors, Validator} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager, unique, validateForm} from '@kodality-web/core-util';
import {Sequence} from '../_lib/models/sequence';
import {SequenceService} from '../services/sequence.service';

const getInvalidCodeChars = (v: string): string[] => v?.match(/[^\w-]/gm)?.filter(unique) || [];

@Directive({
  selector: '[twInvalidSequenceCode]',
  providers: [{provide: NG_VALIDATORS, useExisting: InvalidSequenceCodeValidatorDirective, multi: true}]
})
export class InvalidSequenceCodeValidatorDirective implements Validator {
  public validate(control: AbstractControl): ValidationErrors | null {
    const chars = getInvalidCodeChars(control.value);
    return chars.length ? {sequenceInvalidCharacters: chars} : null;
  }
}

@Component({
  templateUrl: 'sequence-edit.component.html',
})
export class SequenceEditComponent implements OnInit {
  protected sequence?: Sequence;
  protected loader = new LoadingManager();

  @ViewChild(NgForm) public form?: NgForm;

  public constructor(
    private sequenceService: SequenceService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

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
