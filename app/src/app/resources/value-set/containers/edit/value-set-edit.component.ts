import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ValueSet, ValueSetTransactionRequest} from 'term-web/resources/_lib';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceVersionFormComponent} from 'term-web/resources/resource/components/resource-version-form.component';
import {ResourceUtil} from 'term-web/resources/resource/util/resource-util';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {ResourceConfigurationAttributesComponent} from 'term-web/resources/resource/components/resource-configuration-attributes.component';
import {AuthService} from 'term-web/core/auth';
import { MuiSpinnerModule, MuiCardModule, MuiButtonModule, MuiIconModule } from '@kodality-web/marina-ui';

import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { ResourceFormComponent as ResourceFormComponent_1 } from 'term-web/resources/resource/components/resource-form.component';
import { ResourceIdentifiersComponent as ResourceIdentifiersComponent_1 } from 'term-web/resources/resource/components/resource-identifiers.component';
import { ResourceConfigurationAttributesComponent as ResourceConfigurationAttributesComponent_1 } from 'term-web/resources/resource/components/resource-configuration-attributes.component';
import { ResourceContactsComponent } from 'term-web/resources/resource/components/resource-contacts.component';
import { ResourceVersionFormComponent as ResourceVersionFormComponent_1 } from 'term-web/resources/resource/components/resource-version-form.component';
import { ResourceSideInfoComponent } from 'term-web/resources/resource/components/resource-side-info.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'value-set-edit.component.html',
    imports: [MuiSpinnerModule, FormsModule, NzRowDirective, NzColDirective, MuiCardModule, ResourceFormComponent_1, ResourceIdentifiersComponent_1, ResourceConfigurationAttributesComponent_1, ResourceContactsComponent, ResourceVersionFormComponent_1, MuiButtonModule, MuiIconModule, ResourceSideInfoComponent, TranslatePipe]
})
export class ValueSetEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private valueSetService = inject(ValueSetService);
  private authService = inject(AuthService);

  protected valueSet?: ValueSet;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';
  protected viewMode = false;
  protected canEdit = false;

  @ViewChild("form") public form?: NgForm;
  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ResourceVersionFormComponent) public resourceVersionFormComponent?: ResourceVersionFormComponent;
  @ViewChild(ResourceConfigurationAttributesComponent) public resourceConfigurationAttributesComponent?: ResourceConfigurationAttributesComponent;

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

      if (isDefined(id)) {
        this.mode = 'edit';
        this.viewMode = true;
        this.canEdit = this.authService.hasPrivilege(id + '.ValueSet.edit');
        this.loader.wrap('load', this.valueSetService.load(id)).subscribe(vs => this.valueSet = this.writeVS(vs));
      }
      this.valueSet = this.writeVS(new ValueSet());
    });
  }

  protected save(): void {
    if (![
      this.validate(),
      (!this.resourceFormComponent || this.resourceFormComponent.valid()),
      (!this.resourceIdentifiersComponent || this.resourceIdentifiersComponent.valid()),
      (!this.resourceVersionFormComponent || this.resourceVersionFormComponent.valid()),
      (!this.resourceConfigurationAttributesComponent || this.resourceConfigurationAttributesComponent.valid())
    ].every(Boolean)) {
      return;
    }

    this.valueSet.configurationAttributes = this.resourceConfigurationAttributesComponent.attributes;
    const vs = copyDeep(this.valueSet);
    ResourceUtil.merge(vs, this.resourceFormComponent.getResource());
    const request: ValueSetTransactionRequest = {
      valueSet: vs,
      version: this.resourceVersionFormComponent?.getVersion()
    };
    this.loader.wrap('save', this.valueSetService.saveValueSet(request))
      .subscribe(() => this.router.navigate(['/resources/value-sets', vs.id, 'summary']));
  }

  protected validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  private writeVS(vs: ValueSet): ValueSet {
    vs.copyright ??= {};
    vs.permissions ??= {};
    vs.topic ??= {};
    vs.settings ??= {};
    vs.identifiers ??= [];
    vs.configurationAttributes ??= [];
    return vs;
  }
}
