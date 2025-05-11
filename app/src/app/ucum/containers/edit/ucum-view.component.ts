import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ComponentStateStore } from '@kodality-web/core-util';
import { DefinedUnit } from 'term-web/ucum/_lib';
import {NgForm} from "@angular/forms";

@Component({
  templateUrl: './ucum-view.component.html',
})
export class UcumViewComponent implements OnInit {
  public unit: DefinedUnit | undefined;
  private readonly STORE_KEY = 'ucum-list';
  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private route: ActivatedRoute,
    private stateStore: ComponentStateStore,
    private location: Location,
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    const key = this.route.snapshot.paramMap.get('key');
    const state = this.stateStore.pop(this.STORE_KEY);
    const all: DefinedUnit[] = state?.allUnits || [];
    this.unit = all.find(u => `${u.kind}${u.code}` === key);
    this.loading = false;
  }

  public goBack(): void {
    this.location.back();
  }
}