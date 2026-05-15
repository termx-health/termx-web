import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@termx-health/core-util';
import {CodeSystem, CodeSystemTransactionRequest} from 'term-web/resources/_lib';
import {CodeSystemPropertiesComponent} from 'term-web/resources/code-system/containers/edit/property/code-system-properties.component';
import {CodeSystemValueSetAddComponent} from 'term-web/resources/code-system/containers/edit/valueset/code-system-value-set-add.component';
import {ResourceConfigurationAttributesComponent} from 'term-web/resources/resource/components/resource-configuration-attributes.component';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceVersionFormComponent} from 'term-web/resources/resource/components/resource-version-form.component';
import {ResourceUtil} from 'term-web/resources/resource/util/resource-util';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import {AuthService} from 'term-web/core/auth';
import { MuiSpinnerModule, MuiCardModule, MuiFormModule, MuiRadioModule, MuiCheckboxModule, MuiButtonModule, MuiIconModule } from '@termx-health/ui';

import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { ResourceFormComponent as ResourceFormComponent_1 } from 'term-web/resources/resource/components/resource-form.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { AssociationTypeSearchComponent } from 'term-web/resources/_lib/association/containers/association-type-search.component';
import { SequenceSelectComponent } from 'term-web/sequence/_lib/components/sequence-select.component';
import { ResourceIdentifiersComponent as ResourceIdentifiersComponent_1 } from 'term-web/resources/resource/components/resource-identifiers.component';
import { ResourceConfigurationAttributesComponent as ResourceConfigurationAttributesComponent_1 } from 'term-web/resources/resource/components/resource-configuration-attributes.component';
import { CodeSystemPropertiesComponent as CodeSystemPropertiesComponent_1 } from 'term-web/resources/code-system/containers/edit/property/code-system-properties.component';
import { ResourceContactsComponent } from 'term-web/resources/resource/components/resource-contacts.component';
import { ResourceVersionFormComponent as ResourceVersionFormComponent_1 } from 'term-web/resources/resource/components/resource-version-form.component';
import { CodeSystemValueSetAddComponent as CodeSystemValueSetAddComponent_1 } from 'term-web/resources/code-system/containers/edit/valueset/code-system-value-set-add.component';
import { ResourceReadonlyConceptComponent } from 'term-web/resources/resource/components/resource-readonly-concept.component';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { ResourceSideInfoComponent } from 'term-web/resources/resource/components/resource-side-info.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: 'code-system-edit.component.html',
    imports: [MuiSpinnerModule, FormsModule, NzRowDirective, NzColDirective, MuiCardModule, ResourceContextComponent, ResourceFormComponent_1, MuiFormModule, ValueSetConceptSelectComponent, CodeSystemSearchComponent, MuiRadioModule, AssociationTypeSearchComponent, SequenceSelectComponent, MuiCheckboxModule, ResourceIdentifiersComponent_1, ResourceConfigurationAttributesComponent_1, CodeSystemPropertiesComponent_1, ResourceContactsComponent, ResourceVersionFormComponent_1, CodeSystemValueSetAddComponent_1, ResourceReadonlyConceptComponent, MuiButtonModule, MuiIconModule, ResourceSideInfoComponent, TranslatePipe]
})
export class CodeSystemEditComponent implements OnInit {
  private codeSystemService = inject(CodeSystemService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected codeSystem?: CodeSystem;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';
  protected viewMode = false;
  protected canEdit = false;
  protected versions: any[] = [];

  @ViewChild("form") public form?: NgForm;

  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ResourceVersionFormComponent) public resourceVersionFormComponent?: ResourceVersionFormComponent;
  @ViewChild(CodeSystemPropertiesComponent) public codeSystemPropertiesComponent?: CodeSystemPropertiesComponent;
  @ViewChild(CodeSystemValueSetAddComponent) public codeSystemRelationsComponent?: CodeSystemValueSetAddComponent;
  @ViewChild(ResourceConfigurationAttributesComponent) public resourceConfigurationAttributesComponent?: ResourceConfigurationAttributesComponent;

  public ngOnInit(): void {
    this.viewMode = this.route.snapshot.routeConfig?.path === ':id/details';
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

     if (isDefined(id)) {
       this.mode = 'edit';
       this.canEdit = this.authService.hasPrivilege(id + '.CodeSystem.write');
       this.loader.wrap('load', this.codeSystemService.load(id)).subscribe(vs => this.codeSystem = this.writeCS(vs));
       this.codeSystemService.searchVersions(id, {limit: -1}).subscribe(r => this.versions = r.data);
     }
     this.codeSystem = this.writeCS(new CodeSystem());
    });
  }

  public save(): void {
    if (![
      this.validate(),
      (!this.resourceFormComponent || this.resourceFormComponent.valid()),
      (!this.resourceIdentifiersComponent || this.resourceIdentifiersComponent.valid()),
      (!this.resourceVersionFormComponent || this.resourceVersionFormComponent.valid()),
      (!this.codeSystemRelationsComponent || this.codeSystemRelationsComponent.valid()),
      (!this.codeSystemPropertiesComponent || this.codeSystemPropertiesComponent.valid()),
      (!this.resourceConfigurationAttributesComponent || this.resourceConfigurationAttributesComponent.valid())
    ].every(Boolean)) {
      return;
    }

    this.codeSystem.configurationAttributes = this.resourceConfigurationAttributesComponent.attributes;
    const cs = copyDeep(this.codeSystem);
    ResourceUtil.merge(cs, this.resourceFormComponent.getResource());
    const request: CodeSystemTransactionRequest = {
      codeSystem: cs,
      properties: this.codeSystemPropertiesComponent.getProperties(),
      valueSet: this.codeSystemRelationsComponent?.getValueSet(),
      version: this.resourceVersionFormComponent?.getVersion()
    };
    this.loader.wrap('save', this.codeSystemService.saveCodeSystem(request))
      .subscribe(() => this.router.navigate(['/resources/code-systems', cs.id, 'summary']));
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  protected openEdit(): void {
    if (this.codeSystem?.id) {
      this.router.navigate(['/resources/code-systems', this.codeSystem.id, 'edit']);
    }
  }

  private writeCS(cs: CodeSystem): CodeSystem {
    cs.content ??= 'complete';
    cs.caseSensitive ??= 'ci';
    cs.copyright ??= {};
    cs.permissions ??= {};
    cs.settings ??= {};
    cs.topic ??= {};
    cs.identifiers ??= [];
    cs.properties ??= [];
    cs.configurationAttributes ??= [];
    return cs;
  }
}
