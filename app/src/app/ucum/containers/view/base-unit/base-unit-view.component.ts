import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ComponentStateStore } from '@kodality-web/core-util';
import { NgForm } from "@angular/forms";
import { UcumLibService, BaseUnit } from 'term-web/ucum/_lib';

@Component({
  templateUrl: './base-unit-view.component.html',
})
export class BaseUnitViewComponent implements OnInit {
  public baseUnit: BaseUnit | undefined;
  private readonly STORE_KEY = 'base-unit-list';
  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private route: ActivatedRoute,
    private stateStore: ComponentStateStore,
    private location: Location,
    private ucumSvc: UcumLibService
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    const code = this.route.snapshot.paramMap.get('code');
    const baseUnits = this.stateStore.pop(this.STORE_KEY);
    const all: BaseUnit[] = baseUnits || [];
    this.baseUnit = all.find(p => `${p.code}` === code);

    if (!this.baseUnit) {
      this.ucumSvc.loadBaseUnitByCode(code)
        .subscribe(bUnit => this.baseUnit = bUnit);
    }
    this.loading = false;
  }

  public goBack(): void {
    this.location.back();
  }
}