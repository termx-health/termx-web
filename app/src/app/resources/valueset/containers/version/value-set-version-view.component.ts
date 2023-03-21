import {Component, OnInit, ViewChild} from '@angular/core';
import {ValueSetVersion} from 'term-web/resources/_lib';
import {ActivatedRoute} from '@angular/router';
import {ValueSetService} from '../../services/value-set.service';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ValueSetVersionConceptModalComponent} from './concepts/value-set-version-concept-modal.component';

@Component({
  templateUrl: 'value-set-version-view.component.html',
})
export class ValueSetVersionViewComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSetVersion?: string | null;
  public version?: ValueSetVersion;
  public loading = false;

  @ViewChild("form") public form?: NgForm;
  @ViewChild("conceptModal") public conceptModal?: ValueSetVersionConceptModalComponent;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.valueSetVersion = this.route.snapshot.paramMap.get('versionCode');
    this.loadVersion(this.valueSetId!, this.valueSetVersion!);
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    this.valueSetService.loadVersion(id, version).subscribe(version => this.version = version).add(() => this.loading = false);
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

  public expand(): void {
    this.valueSetService.expand({valueSet: this.valueSetId!, valueSetVersion: this.valueSetVersion!}).subscribe(vsConcepts => {
      this.conceptModal?.toggleModal(vsConcepts);
    });
  }
}
