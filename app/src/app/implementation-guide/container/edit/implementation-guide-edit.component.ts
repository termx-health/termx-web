import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ImplementationGuide, ImplementationGuideTransactionRequest} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceUtil} from 'term-web/resources/resource/util/resource-util';
import {ImplementationGuideVersionFormComponent} from 'term-web/implementation-guide/container/version/implementation-guide-version-form.component';

@Component({
  templateUrl: 'implementation-guide-edit.component.html'
})
export class ImplementationGuideEditComponent implements OnInit {
  protected ig?: ImplementationGuide;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ImplementationGuideVersionFormComponent) public versionFormComponent?: ImplementationGuideVersionFormComponent;

  public constructor(
    private igService: ImplementationGuideService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
   this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

     if (isDefined(id)) {
       this.mode = 'edit';
       this.loader.wrap('load', this.igService.load(id)).subscribe(ig => this.ig = this.writeIG(ig));
     }
     this.ig = this.writeIG(new ImplementationGuide());
    });
  }

  public save(): void {
    if (![
      this.validate(),
      (!this.resourceFormComponent || this.resourceFormComponent.valid()),
      (!this.resourceIdentifiersComponent || this.resourceIdentifiersComponent.valid()),
      (!this.versionFormComponent || this.versionFormComponent.valid())
    ].every(Boolean)) {
      return;
    }


    const ig = copyDeep(this.ig);
    ResourceUtil.merge(ig, this.resourceFormComponent.getResource());
    const request: ImplementationGuideTransactionRequest = {
      implementationGuide: ig,
      version: this.versionFormComponent.getVersion()
    };
    this.loader.wrap('save', this.igService.save(request))
      .subscribe(() => this.router.navigate(['/resources/implementation-guide', ig.id, 'summary']));
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  private writeIG(ig: ImplementationGuide): ImplementationGuide {
    ig.copyright ??= {};
    ig.identifiers ??= [];
    ig.contacts ??= [];
    return ig;
  }
}
