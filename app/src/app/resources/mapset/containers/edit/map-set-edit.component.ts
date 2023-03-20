import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {MapSetService} from '../../services/map-set-service';
import {MapSet} from '@terminology/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';

@Component({
  templateUrl: './map-set-edit.component.html',
})
export class MapSetEditComponent implements OnInit {
  public mapSetId?: string | null;
  public mapSet?: MapSet;

  public loading: {[key: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form!: NgForm;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    this.mode = this.mapSetId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loading['init'] = true;
      this.mapSetService.load(this.mapSetId!).subscribe(cs => this.mapSet = cs).add(() => this.loading['init'] = false);
    } else {
      this.mapSet = new MapSet();
      this.mapSet.names = {};
    }
  }


  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.mapSetService.save(this.mapSet!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }
}
