import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {MapSetService} from '../../services/map-set-service';
import {MapSetFormComponent} from './map-set-form.component';

@Component({
  selector: 'twa-map-set-edit',
  templateUrl: './map-set-edit.component.html',
})
export class MapSetEditComponent implements OnInit {
  public mapSetId?: string | null;

  public loading = false;
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("mapSetForm") public mapSetForm!: MapSetFormComponent;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    this.mode = this.mapSetId ? 'edit' : 'add';
  }


  public save(): void {
    if (!this.mapSetForm.validate()) {
      return;
    }
    this.loading = true;
    this.mapSetService.save(this.mapSetForm.readForm()!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
