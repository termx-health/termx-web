import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {copyDeep, isDefined, LoadingManager, validateForm} from '@termx-health/core-util';
import {ImplementationGuide, ImplementationGuideTransactionRequest} from 'term-web/implementation-guide/_lib';
import {ImplementationGuideVersionFormComponent} from 'term-web/implementation-guide/container/version/edit/implementation-guide-version-form.component';
import {ImplementationGuideService} from 'term-web/implementation-guide/services/implementation-guide.service';
import {ResourceFormComponent} from 'term-web/resources/resource/components/resource-form.component';
import {ResourceIdentifiersComponent} from 'term-web/resources/resource/components/resource-identifiers.component';
import {ResourceUtil} from 'term-web/resources/resource/util/resource-util';
import { MuiSpinnerModule, MuiCardModule, MuiDividerModule, MuiButtonModule } from '@termx-health/ui';

import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { ResourceFormComponent as ResourceFormComponent_1 } from 'term-web/resources/resource/components/resource-form.component';
import { ResourceIdentifiersComponent as ResourceIdentifiersComponent_1 } from 'term-web/resources/resource/components/resource-identifiers.component';
import { ResourceContactsComponent } from 'term-web/resources/resource/components/resource-contacts.component';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { ImplementationGuideVersionFormComponent as ImplementationGuideVersionFormComponent_1 } from 'term-web/implementation-guide/container/version/edit/implementation-guide-version-form.component';
import { ResourceSideInfoComponent } from 'term-web/resources/resource/components/resource-side-info.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'implementation-guide-edit.component.html',
    imports: [MuiSpinnerModule, FormsModule, NzRowDirective, NzColDirective, MuiCardModule, ResourceFormComponent_1, ResourceIdentifiersComponent_1, ResourceContactsComponent, MuiDividerModule, StatusTagComponent, ImplementationGuideVersionFormComponent_1, MuiButtonModule, ResourceSideInfoComponent, TranslatePipe]
})
export class ImplementationGuideEditComponent implements OnInit {
  private igService = inject(ImplementationGuideService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected ig?: ImplementationGuide;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild(ResourceFormComponent) public resourceFormComponent?: ResourceFormComponent;
  @ViewChild(ResourceIdentifiersComponent) public resourceIdentifiersComponent?: ResourceIdentifiersComponent;
  @ViewChild(ImplementationGuideVersionFormComponent) public versionFormComponent?: ImplementationGuideVersionFormComponent;

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
      version: this.versionFormComponent?.getVersion()
    };
    this.loader.wrap('save', this.igService.save(request))
      .subscribe(() => this.router.navigate(['/resources/implementation-guides', ig.id, 'summary']));
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  private writeIG(ig: ImplementationGuide): ImplementationGuide {
    ig.copyright ??= {};
    ig.topic ??= {};
    ig.identifiers ??= [];
    ig.contacts ??= [];
    return ig;
  }
}
