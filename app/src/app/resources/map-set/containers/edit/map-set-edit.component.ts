import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MapSet, MapSetProperty, MapSetScope, MapSetVersion} from 'term-web/resources/_lib';
import {MapSetPropertiesComponent} from 'term-web/resources/map-set/containers/edit/property/map-set-properties.component';
import {MapSetScopeFormComponent} from 'term-web/resources/map-set/containers/version/edit/scope/map-set-scope-form.component';
import {ResourceConfigurationAttributesComponent} from 'term-web/resources/resource/components/resource-configuration-attributes.component';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceVersionFormComponent} from 'term-web/resources/resource/components/resource-version-form.component';
import {ResourceUtil} from 'term-web/resources/resource/util/resource-util';
import {MapSetService} from 'term-web/resources/map-set/services/map-set-service';
import {AuthService} from 'term-web/core/auth';
import { MuiSpinnerModule, MuiCardModule, MuiButtonModule, MuiIconModule } from '@kodality-web/marina-ui';

import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { ResourceFormComponent as ResourceFormComponent_1 } from 'term-web/resources/resource/components/resource-form.component';
import { MapSetPropertiesComponent as MapSetPropertiesComponent_1 } from 'term-web/resources/map-set/containers/edit/property/map-set-properties.component';
import { ResourceIdentifiersComponent as ResourceIdentifiersComponent_1 } from 'term-web/resources/resource/components/resource-identifiers.component';
import { ResourceConfigurationAttributesComponent as ResourceConfigurationAttributesComponent_1 } from 'term-web/resources/resource/components/resource-configuration-attributes.component';
import { ResourceContactsComponent } from 'term-web/resources/resource/components/resource-contacts.component';
import { ResourceVersionFormComponent as ResourceVersionFormComponent_1 } from 'term-web/resources/resource/components/resource-version-form.component';
import { MapSetScopeFormComponent as MapSetScopeFormComponent_1 } from 'term-web/resources/map-set/containers/version/edit/scope/map-set-scope-form.component';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { ResourceSideInfoComponent } from 'term-web/resources/resource/components/resource-side-info.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './map-set-edit.component.html',
    imports: [
    MuiSpinnerModule,
    FormsModule,
    NzRowDirective,
    NzColDirective,
    MuiCardModule,
    ResourceContextComponent,
    ResourceFormComponent_1,
    MapSetPropertiesComponent_1,
    ResourceIdentifiersComponent_1,
    ResourceConfigurationAttributesComponent_1,
    ResourceContactsComponent,
    ResourceVersionFormComponent_1,
    MapSetScopeFormComponent_1,
    MuiButtonModule,
    MuiIconModule,
    ResourceSideInfoComponent,
    TranslatePipe
],
})
export class MapSetEditComponent implements OnInit {
  private mapSetService = inject(MapSetService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected mapSet?: MapSet;
  protected scope: MapSetScope = {
    sourceType: 'code-system', sourceCodeSystems: [],
    targetType: 'code-system', targetCodeSystems: []
  };
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';
  protected viewMode = false;
  protected canEdit = false;
  protected versions: any[] = [];

  @ViewChild("form") public form!: NgForm;

  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(MapSetPropertiesComponent) public mapSetPropertiesComponent?: MapSetPropertiesComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ResourceVersionFormComponent) public resourceVersionFormComponent?: ResourceVersionFormComponent;
  @ViewChild(MapSetScopeFormComponent) public mapSetScopeFormComponent?: MapSetScopeFormComponent;
  @ViewChild(ResourceConfigurationAttributesComponent) public resourceConfigurationAttributesComponent?: ResourceConfigurationAttributesComponent;

  public ngOnInit(): void {
    this.viewMode = this.route.snapshot.routeConfig?.path === ':id/details';
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

      if (isDefined(id)) {
        this.mode = 'edit';
        this.canEdit = this.authService.hasPrivilege(id + '.MapSet.edit');
        this.loader.wrap('load', this.mapSetService.load(id)).subscribe(vs => this.mapSet = this.writeMS(vs));
        this.mapSetService.searchVersions(id, {limit: -1}).subscribe(r => this.versions = r.data);
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
      (!this.mapSetScopeFormComponent || this.mapSetScopeFormComponent.valid()),
      (!this.resourceConfigurationAttributesComponent || this.resourceConfigurationAttributesComponent.valid())
    ].every(Boolean)) {
      return;
    }

    this.mapSet.configurationAttributes = this.resourceConfigurationAttributesComponent.attributes;
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

  protected openEdit(): void {
    if (this.mapSet?.id) {
      this.router.navigate(['/resources/map-sets', this.mapSet.id, 'edit']);
    }
  }

  private writeMS(ms: MapSet): MapSet {
    ms.copyright ??= {};
    ms.settings ??= {};
    ms.topic ??= {};
    ms.identifiers ??= [];
    ms.properties ??= [];
    ms.configurationAttributes ??= [];
    return ms;
  }
}
