import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ComponentStateStore } from '@kodality-web/core-util';
import { DefinedUnit } from 'term-web/ucum/_lib';
import { NgForm } from "@angular/forms";
import { UcumLibService } from 'term-web/ucum/_lib';

@Component({
  templateUrl: './defined-unit-view.component.html',
})
export class DefinedUnitViewComponent implements OnInit {
  public unit: DefinedUnit | undefined;
  private readonly STORE_KEY = 'defined-unit-list';
  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private route: ActivatedRoute,
    private stateStore: ComponentStateStore,
    private location: Location,
    private ucumCmpSvc: UcumLibService
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    const code = this.route.snapshot.paramMap.get('code');
    const units = this.stateStore.pop(this.STORE_KEY);
    const all: DefinedUnit[] = units || [];
    this.unit = all.find(u => `${u.code}` === code);

    if (!this.unit) {
      this.ucumCmpSvc.loadUnitByCode(code)
        .subscribe(unit => this.unit = unit);
    }
    this.loading = false;
  }

  public goBack(): void {
    this.location.back();
  }
}