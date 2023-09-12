import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MapSetService} from '../../services/map-set-service';
import {MapSet, MapSetProperty, MapSetScope, MapSetVersion} from 'term-web/resources/_lib';
import {NgForm} from '@angular/forms';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceVersionFormComponent} from 'term-web/resources/resource/components/resource-version-form.component';
import {ResourceUtil} from 'term-web/resources/resource/util/resource-util';
import {MapSetScopeFormComponent} from 'term-web/resources/map-set/containers/version/edit/scope/map-set-scope-form.component';
import {MapSetPropertiesComponent} from 'term-web/resources/map-set/containers/edit/property/map-set-properties.component';

@Component({
  templateUrl: './map-set-edit.component.html',
})
export class MapSetEditComponent implements OnInit {
  protected mapSet?: MapSet;
  protected scope: MapSetScope = {
    sourceType: 'code-system', sourceCodeSystems: [],
    targetType: 'code-system', targetCodeSystems: []
  };
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form!: NgForm;

  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(MapSetPropertiesComponent) public mapSetPropertiesComponent?: MapSetPropertiesComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ResourceVersionFormComponent) public resourceVersionFormComponent?: ResourceVersionFormComponent;
  @ViewChild(MapSetScopeFormComponent) public mapSetScopeFormComponent?: MapSetScopeFormComponent;

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

      if (isDefined(id)) {
        this.mode = 'edit';
        this.loader.wrap('load', this.mapSetService.load(id)).subscribe(vs => this.mapSet = this.writeMS(vs));
      }
      this.mapSet = this.writeMS(new MapSet());
    });
  }

  public save(): void {
    if (![
      this.validate(),
      (!this.resourceFormComponent || this.resourceFormComponent.valid()),
      (!this.resourceIdentifiersComponent || this.resourceIdentifiersComponent.valid()),
      (!this.resourceVersionFormComponent || this.resourceVersionFormComponent.valid()),
      (!this.mapSetPropertiesComponent || this.mapSetPropertiesComponent.valid()),
      (!this.mapSetScopeFormComponent || this.mapSetScopeFormComponent.valid())
    ].every(Boolean)) {
      return;
    }


    const ms = copyDeep(this.mapSet);
    ResourceUtil.merge(ms, this.resourceFormComponent.getResource());

    const msv: MapSetVersion = this.resourceVersionFormComponent ? copyDeep(this.resourceVersionFormComponent.getVersion()) : undefined;
    const properties: MapSetProperty[] = this.mapSetPropertiesComponent ? copyDeep(this.mapSetPropertiesComponent.getProperties()) : undefined;
    if (msv) {
      msv.scope = this.mapSetScopeFormComponent?.scope;
    }

    this.loader.wrap('save', this.mapSetService.saveMapSet({mapSet: ms, version: msv, properties: properties}))
      .subscribe(() => this.router.navigate(['/resources/map-sets', ms.id, 'summary']));
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  private writeMS(ms: MapSet): MapSet {
    ms.copyright ??= {};
    ms.settings ??= {};
    ms.identifiers ??= [];
    ms.properties ??= [];
    return ms;
  }
}
