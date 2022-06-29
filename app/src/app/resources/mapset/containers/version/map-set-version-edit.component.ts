import {Component, OnInit, ViewChild} from '@angular/core';
import {MapSetVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {MapSetService} from '../../services/map-set-service';


@Component({
  templateUrl: './map-set-version-edit.component.html',
})
export class MapSetVersionEditComponent implements OnInit {
  public mapSetId?: string | null;
  public mapSetVersion?: string | null;
  public version?: MapSetVersion;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    this.mapSetVersion = this.route.snapshot.paramMap.get('versionId');
    this.mode = this.mapSetId && this.mapSetVersion ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.mapSetId!, this.mapSetVersion!);
    } else {
      this.version = new MapSetVersion();
      this.version.status = 'draft';
    }
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    this.mapSetService.loadVersion(id, version).subscribe(v => this.version = v).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.mapSetService.saveVersion(this.mapSetId!, this.version!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
