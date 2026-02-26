import {Component, ViewChild} from '@angular/core';
import { UcumLibService } from 'term-web/ucum/_lib';
import {NgForm} from "@angular/forms";
import {ValidateResponse} from "term-web/ucum/_lib/model/validate-response";
import {finalize} from "rxjs/operators";


@Component({
  templateUrl: './validate.component.html',
})
export class ValidateComponent {
  public loading = false;
  public code: string;
  public response: ValidateResponse | undefined;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private ucumOpsSvc: UcumLibService,
  ) {}

  public validate(): void {
    this.loading = true;
    this.response = undefined;

    this.ucumOpsSvc.validate(this.code)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        response => {
          this.response = response;
        }
      );
  }
}