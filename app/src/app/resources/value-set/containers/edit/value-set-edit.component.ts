import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ValueSet, ValueSetTransactionRequest} from 'app/src/app/resources/_lib';
import {ResourceFormComponent} from 'app/src/app/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'app/src/app/resources/resource/components/resource-identifiers.component';
import {ResourceVersionFormComponent} from 'app/src/app/resources/resource/components/resource-version-form.component';
import {ResourceUtil} from 'app/src/app/resources/resource/util/resource-util';
import {ValueSetService} from 'app/src/app/resources/value-set/services/value-set.service';
import {ResourceConfigurationAttributesComponent} from 'term-web/resources/resource/components/resource-configuration-attributes.component';


@Component({
  templateUrl: 'value-set-edit.component.html'
})
export class ValueSetEditComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ResourceVersionFormComponent) public resourceVersionFormComponent?: ResourceVersionFormComponent;
  @ViewChild(ResourceConfigurationAttributesComponent) public resourceConfigurationAttributesComponent?: ResourceConfigurationAttributesComponent;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private valueSetService: ValueSetService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

      if (isDefined(id)) {
        this.mode = 'edit';
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
