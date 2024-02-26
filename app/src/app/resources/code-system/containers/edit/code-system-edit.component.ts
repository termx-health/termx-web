import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {CodeSystem, CodeSystemTransactionRequest} from 'term-web/resources/_lib';
import {CodeSystemPropertiesComponent} from 'term-web/resources/code-system/containers/edit/property/code-system-properties.component';
import {CodeSystemValueSetAddComponent} from 'term-web/resources/code-system/containers/edit/valueset/code-system-value-set-add.component';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceVersionFormComponent} from 'term-web/resources/resource/components/resource-version-form.component';
import {ResourceUtil} from 'term-web/resources/resource/util/resource-util';
import {CodeSystemService} from '../../services/code-system.service';


@Component({
  templateUrl: 'code-system-edit.component.html'
})
export class CodeSystemEditComponent implements OnInit {
  protected codeSystem?: CodeSystem;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ResourceVersionFormComponent) public resourceVersionFormComponent?: ResourceVersionFormComponent;
  @ViewChild(CodeSystemPropertiesComponent) public codeSystemPropertiesComponent?: CodeSystemPropertiesComponent;
  @ViewChild(CodeSystemValueSetAddComponent) public codeSystemRelationsComponent?: CodeSystemValueSetAddComponent;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
   this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

     if (isDefined(id)) {
       this.mode = 'edit';
       this.loader.wrap('load', this.codeSystemService.load(id)).subscribe(vs => this.codeSystem = this.writeCS(vs));
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
      (!this.codeSystemPropertiesComponent || this.codeSystemPropertiesComponent.valid())
    ].every(Boolean)) {
      return;
    }


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
