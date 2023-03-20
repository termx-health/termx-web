import {Component, OnInit, ViewChild} from '@angular/core';
import {MapSetVersion} from '@terminology/core';
import {ActivatedRoute} from '@angular/router';
import {MapSetService} from '../../services/map-set-service';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';


@Component({
  templateUrl: './map-set-version-view.component.html',
})
export class MapSetVersionViewComponent implements OnInit {
  public mapSetId?: string | null;
  public version?: MapSetVersion;

  public loading: {[key: string]: boolean} = {};
  @ViewChild("form") public form?: NgForm;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    const mapSetVersion = this.route.snapshot.paramMap.get('versionId');
    this.loadVersion(this.mapSetId!, mapSetVersion!);
  }

  private loadVersion(id: string, version: string): void {
    this.loading['init'] = true;
    this.mapSetService.loadVersion(id, version).subscribe(v => this.version = v).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.mapSetService.saveVersion(this.mapSetId!, this.version!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }
  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
