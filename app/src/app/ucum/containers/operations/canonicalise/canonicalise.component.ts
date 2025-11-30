import {Component, ViewChild} from '@angular/core';
import { UcumLibService } from 'term-web/ucum/_lib';
import {NgForm} from "@angular/forms";
import {CanonicaliseResponse} from "term-web/ucum/_lib/model/canonicalise-response";
import {finalize} from "rxjs/operators";


@Component({
  templateUrl: './canonicalise.component.html',
})
export class CanonicaliseComponent {
  public loading = false;
  public code: string;
  public response: CanonicaliseResponse | undefined;
  public error: string | undefined;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private ucumOpsSvc: UcumLibService,
  ) {}

  public canonicalise(): void {
    this.loading = true;
    this.response = undefined;
    this.error = undefined;

    this.ucumOpsSvc.canonicalise(this.code)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        response => {
          this.response = response;
        },
        error => {
          if (error.status == 400) {
            this.error = error.error.message;
          }
        }
      );
  }
}