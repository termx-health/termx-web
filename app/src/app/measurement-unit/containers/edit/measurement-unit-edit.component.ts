import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {DateRange, isDefined, validateForm} from '@termx-health/core-util';
import {MeasurementUnit} from 'term-web/measurement-unit/_lib';
import {MeasurementUnitService} from 'term-web/measurement-unit/services/measurement-unit.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiInputModule, MuiMultiLanguageInputModule, MuiDatePickerModule, MuiNumberInputModule, MuiSelectModule, MuiButtonModule } from '@termx-health/ui';
import { MeasurementUnitMappingListComponent } from 'term-web/measurement-unit/containers/mapping/measurement-unit-mapping-list.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './measurement-unit-edit.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    FormsModule,
    MuiInputModule,
    MuiMultiLanguageInputModule,
    MuiDatePickerModule,
    MuiNumberInputModule,
    MuiSelectModule,
    MuiButtonModule,
    MeasurementUnitMappingListComponent,
    TranslatePipe
],
})
export class MeasurementUnitEditComponent implements OnInit {
  private measurementUnitService = inject(MeasurementUnitService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  public measurementUnitId?: number;
  public measurementUnit?: MeasurementUnit;
  public kinds?: string[];
  public newKind = false;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public ngOnInit(): void {
    this.measurementUnitId = Number(this.route.snapshot.paramMap.get('id'));
    this.mode = this.measurementUnitId ? 'edit' : 'add';
    this.loading['kinds'] = true;
    this.measurementUnitService.loadKinds().subscribe(kinds => this.kinds = kinds).add(() => this.loading['kinds'] = false);

    if (this.mode === 'add') {
      this.measurementUnit = new MeasurementUnit();
      this.measurementUnit.period = new DateRange();
    }

    if (this.mode === 'edit') {
      this.loading['init'] = true;
      this.measurementUnitService.load(this.measurementUnitId!).subscribe(mu => this.measurementUnit = mu).add(() => this.loading['init'] = false);
    }
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
