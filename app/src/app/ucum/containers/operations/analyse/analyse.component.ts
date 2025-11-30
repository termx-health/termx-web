import {Component, ViewChild} from '@angular/core';
import { UcumLibService } from 'term-web/ucum/_lib';
import {AnalyseResponse} from "term-web/ucum/_lib/model/analyse-response";
import {NgForm} from "@angular/forms";
import { finalize } from 'rxjs/operators';


@Component({
  templateUrl: './analyse.component.html',
})
export class AnalyseComponent {
  public loading = false;
  public code: string;
  public response: AnalyseResponse | undefined;
  public error: string | undefined;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private ucumOpsSvc: UcumLibService,
  ) {}

  public analyse(): void {
    this.loading = true;
    this.response = undefined;
    this.error = undefined;

    this.ucumOpsSvc.analyse(this.code)
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