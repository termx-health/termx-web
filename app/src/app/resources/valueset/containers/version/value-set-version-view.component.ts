import {Component, OnInit, ViewChild} from '@angular/core';
import {ValueSetVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {ValueSetService} from '../../services/value-set.service';

@Component({
  templateUrl: 'value-set-version-view.component.html',
})
export class ValueSetVersionViewComponent implements OnInit {
  public valueSetId?: string | null;
  public version?: ValueSetVersion;

  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    const valueSetVersion = this.route.snapshot.paramMap.get('version');
    this.loadVersion(this.valueSetId!, valueSetVersion!);
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    this.valueSetService.loadVersion(id, version).subscribe(v => this.version = v).add(() => this.loading = false);
  }
}
