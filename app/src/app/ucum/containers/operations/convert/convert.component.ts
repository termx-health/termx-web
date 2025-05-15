import {Component, ViewChild} from '@angular/core';
import { UcumOperationsLibService } from 'term-web/ucum/_lib';
import {NgForm} from "@angular/forms";
import {finalize} from "rxjs/operators";
import {ConvertResponse} from "../../../_lib/model/convert-response";


@Component({
  templateUrl: './convert.component.html',
})
export class ConvertComponent {
  public loading = false;
  public value: number;
  public sourceCode: string;
  public targetCode: string;
  public displayedTargetCode: string | undefined;
  public response: ConvertResponse | undefined;
  public error: string | undefined;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private ucumOpsSvc: UcumOperationsLibService,
  ) {}

  public convert(): void {
    this.loading = true;
    this.response = undefined;
    this.error = undefined;

    this.ucumOpsSvc.convert(this.value, this.sourceCode, this.targetCode)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        response => {
          this.response = response;
          this.displayedTargetCode = this.targetCode;
        },
        error => {
          if (error.status == 400) {
            this.error = error.error.message;
          }
        }
      );
  }
}