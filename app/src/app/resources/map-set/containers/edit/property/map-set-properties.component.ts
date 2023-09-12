import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {DefinedProperty, PropertyRule, MapSetProperty} from 'app/src/app/resources/_lib';
import {BooleanInput, copyDeep, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {DefinedPropertyLibService} from 'term-web/resources/_lib/defined-property/services/defined-property-lib.service';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';

@Component({
  selector: 'tw-ms-properties',
  templateUrl: './map-set-properties.component.html',
})
export class MapSetPropertiesComponent implements OnInit, OnChanges {
  @Input() public mapSetId?: string | null;
  @Input() public properties: MapSetProperty[] = [];
  @Input() @BooleanInput() public viewMode: boolean | string = false;

  protected propertyRowInstance: MapSetProperty = {rule: {filters: []}, status: 'active'};
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  protected definedEntityProperties: DefinedProperty[];

  public constructor(private mapSetService: MapSetService, private definedEntityPropertyService: DefinedPropertyLibService) {}

  public ngOnInit(): void {
    this.definedEntityPropertyService.search({limit: -1}).subscribe(r => this.definedEntityProperties = r.data);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['properties'] && this.properties) {
      this.properties.forEach(p => {
        p.rule ??= new PropertyRule();
        p.rule.filters ??= [];
      });
    }
  }

  public getProperties(): MapSetProperty[] {
    return this.properties;
  }

  public valid(): boolean {
    return validateForm(this.form);
  }

  public deletePropertyUsages(propertyId: number): void {
    this.loader.wrap('load', this.mapSetService.deletePropertyUsages(this.mapSetId, propertyId)).subscribe();
  }

  protected filterDefinedProperties = (p: DefinedProperty): boolean => {
    return p.kind === 'property';
  };

  public addDefinedProperty(dp: DefinedProperty): void {
    const p: MapSetProperty = copyDeep(dp);
    p.definedEntityPropertyId = p.id;
    p.id = undefined;
    p.status = 'active';

    if (!this.properties.find(d => d.name === dp.name)) {
      this.properties = [...this.properties, p];
    }
  }
}
