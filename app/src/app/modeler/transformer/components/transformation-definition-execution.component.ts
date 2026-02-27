import { Component, Input, inject } from '@angular/core';
import { MuiNotificationService, MuiButtonModule, MuiFormModule, MuiCoreModule, MuiTextareaModule, MuiAlertModule } from '@kodality-web/marina-ui';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {TransformationDefinition} from 'term-web/modeler/_lib/transformer/transformation-definition';
import { FormsModule } from '@angular/forms';

import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-transformation-definition-execution',
    templateUrl: './transformation-definition-execution.component.html',
    imports: [
    MuiButtonModule,
    MuiFormModule,
    MuiCoreModule,
    MuiTextareaModule,
    FormsModule,
    MuiAlertModule,
    TranslatePipe
],
})
export class TransformationDefinitionExecutionComponent {
  private transformationDefinitionService = inject(TransformationDefinitionService);
  private notificationService = inject(MuiNotificationService);

  @Input() public definition: TransformationDefinition;
  public result: {result?: string, error?: string};
  public loading: boolean;

  public generate(): void {
    this.transformationDefinitionService.generateInput(this.definition.resources[0]).subscribe(r => {
      this.definition.testSource = r;
    });
  }
  public evaluate(): void {
    if (!TransformationDefinition.isValid(this.definition)) {
      this.notificationService.error('core.form-invalid');
      return;
    }
    this.result = null;
    this.loading = true;
    this.transformationDefinitionService.transform(this.definition.testSource, this.definition).subscribe(r => {
      this.result = r;
      setTimeout(() => document.getElementById('resultEl')?.scrollIntoView({behavior: 'smooth'}));
    }).add(() => this.loading = false);
  }
}
