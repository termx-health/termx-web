import {Component, OnInit, ViewChild} from '@angular/core';
import {ValueSetConcept, ValueSetVersion} from 'terminology-lib/resources';
import {ActivatedRoute} from '@angular/router';
import {ValueSetService} from '../../services/value-set.service';
import {forkJoin} from 'rxjs';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  templateUrl: 'value-set-version-view.component.html',
})
export class ValueSetVersionViewComponent implements OnInit {
  public valueSetId?: string | null;
  public version?: ValueSetVersion;
  public concepts?: ValueSetConcept[];
  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    const valueSetVersion = this.route.snapshot.paramMap.get('versionId');
    this.loadVersion(this.valueSetId!, valueSetVersion!);
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    forkJoin([
      this.valueSetService.loadVersion(id, version),
      this.valueSetService.loadConcepts(id, version)
    ]).subscribe(([version, concepts]) => {
      this.version = version;
      this.concepts = concepts;
    }).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.valueSetService.saveVersion(this.valueSetId!, this.version!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
