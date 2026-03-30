import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import { isDefined, validateForm, KeysPipe, LocalDatePipe } from '@termx-health/core-util';
import {MeasurementUnit} from 'term-web/measurement-unit/_lib';
import {MeasurementUnitService} from 'term-web/measurement-unit/services/measurement-unit.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiDatePickerModule, MuiButtonModule } from '@termx-health/ui';
import { MeasurementUnitMappingListComponent } from 'term-web/measurement-unit/containers/mapping/measurement-unit-mapping-list.component';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { TranslatePipe } from '@ngx-translate/core';
import { HasAnyPrivilegePipe } from 'term-web/core/auth/privileges/has-any-privilege.pipe';

@Component({
    templateUrl: './measurement-unit-view.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    FormsModule,
    MuiDatePickerModule,
    MeasurementUnitMappingListComponent,
    PrivilegedDirective,
    MuiButtonModule,
    TranslatePipe,
    KeysPipe,
    LocalDatePipe,
    HasAnyPrivilegePipe
],
})
export class MeasurementUnitViewComponent implements OnInit {
  private measurementUnitService = inject(MeasurementUnitService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  public measurementUnit?: MeasurementUnit;

  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    const measurementUnitId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading['init'] = true;
    this.measurementUnitService.load(measurementUnitId).subscribe(mu => this.measurementUnit = mu).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.measurementUnitService.save(this.measurementUnit!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
