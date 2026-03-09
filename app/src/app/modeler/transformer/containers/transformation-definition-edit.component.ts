import { Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { copyDeep, LocalDateTimePipe } from '@kodality-web/core-util';
import { MuiNotificationService, MuiSpinnerModule, MuiFormModule, MuiInputModule, MuiIconModule, MuiButtonModule, MuiDropdownModule, MuiCoreModule, MuiPopconfirmModule, MuiCardModule } from '@kodality-web/marina-ui';
import {Observable, of} from 'rxjs';
import {TransformationDefinition, TransformationDefinitionResource} from 'term-web/modeler/_lib/transformer/transformation-definition';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import { PrivilegeContextDirective } from 'term-web/core/auth/privileges/privilege-context.directive';
import { FormsModule } from '@angular/forms';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { TransformationDefinitionResourcesComponent } from 'term-web/modeler/transformer/components/transformation-definition-resources.component';
import { TransformationDefinitionExecutionComponent } from 'term-web/modeler/transformer/components/transformation-definition-execution.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PrivilegedPipe } from 'term-web/core/auth/privileges/privileged.pipe';

@Component({
    templateUrl: './transformation-definition-edit.component.html',
    imports: [MuiSpinnerModule, PrivilegeContextDirective, MuiFormModule, MuiInputModule, FormsModule, MuiIconModule, PrivilegedDirective, MuiButtonModule, MuiDropdownModule, MuiCoreModule, MuiPopconfirmModule, TransformationDefinitionResourcesComponent, MuiCardModule, TransformationDefinitionExecutionComponent, TranslatePipe, LocalDateTimePipe, PrivilegedPipe]
})
export class TransformationDefinitionEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private transformationDefinitionService = inject(TransformationDefinitionService);
  private location = inject(Location);
  private router = inject(Router);
  private notificationService = inject(MuiNotificationService);

  public definition: TransformationDefinition;
  public loading = false;

  public ngOnInit(): void {
    this.loading = true;
    this.initDefinition().subscribe(r => {
      this.definition = r;
      this.definition.mapping.type = 'mapping';
      this.definition.mapping.name = 'main';
    }).add(() => this.loading = false);
  }

  public initDefinition(): Observable<TransformationDefinition> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!!id) {
      return this.transformationDefinitionService.load(Number(id));
    }

    const def = new TransformationDefinition();
    def.resources = [];
    def.mapping = {
      type: 'mapping',
      reference: {}
    };
    return of(def);
  }

  public save(): void {
    if (!TransformationDefinition.isValid(this.definition)) {
      this.notificationService.error('core.form-invalid');
      return;
    }
    const def = copyDeep(this.definition);
    this.cleanResource(def.mapping);
    def.resources.forEach(r => this.cleanResource(r));
    this.loading = true;
    this.transformationDefinitionService.save(def).subscribe(r => {
      if (def.id) {
        this.ngOnInit();
      } else {
        this.router.navigate(['/modeler/transformation-definitions', r.id, 'edit'], {replaceUrl: true});
      }
    }).add(() => this.loading = false);
  }

  public delete(): void {
    this.loading = true;
    this.transformationDefinitionService.delete(this.definition.id)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }

  private cleanResource(r: TransformationDefinitionResource): void {
    r.reference = r.source === 'local' ? {localId: r.reference.localId}
      : r.source === 'url' ? {resourceUrl: r.reference.resourceUrl, resourceServerId: r.reference.resourceServerId}
        : r.source === 'static' ? {content: r.reference.content}
          : {};
  }
}
