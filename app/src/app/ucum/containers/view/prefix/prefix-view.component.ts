import {Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ComponentStateStore } from '@kodality-web/core-util';
import { NgForm } from "@angular/forms";
import { UcumLibService, Prefix } from 'term-web/ucum/_lib';

@Component({
  templateUrl: './prefix-view.component.html',
})
export class PrefixViewComponent implements OnInit {
  public prefix: Prefix | undefined;
  private readonly STORE_KEY = 'prefix-list';
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
    const prefixes = this.stateStore.pop(this.STORE_KEY);
    const all: Prefix[] = prefixes || [];
    this.prefix = all.find(p => `${p.code}` === code);

    if (!this.prefix) {
      this.ucumCmpSvc.loadPrefixByCode(code)
        .subscribe(unit => this.prefix = unit);
    }
    this.loading = false;
  }

  public goBack(): void {
    this.location.back();
  }
}