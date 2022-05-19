import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {MapSet} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {MapSetService} from '../../services/map-set-service';

@Component({
  selector: 'twa-map-set-form',
  templateUrl: './map-set-form.component.html',
})
export class MapSetFormComponent implements OnChanges {
  @Input() public mapSetId?: string;
  @Input() public mode?: 'edit' | 'add';

  public mapSet?: MapSet;
  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(private mapSetService: MapSetService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["mapSetId"]?.currentValue || changes["mode"]?.currentValue) {
      this.initMapSet();
    }
  }

  private initMapSet(): void {
    if (this.mode === 'add') {
      this.mapSet = new MapSet();
      this.mapSet.names = {};
    }

    if (this.mode === 'edit' && this.mapSetId) {
      this.loading = true;
      this.mapSetService.load(this.mapSetId).subscribe(cs => this.mapSet = cs).add(() => this.loading = false);
    }
  }


  public readForm(): MapSet | undefined {
    return this.mapSet;
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
