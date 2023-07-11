import {Component, Input} from '@angular/core';
import {TransformationDefinition} from '../services/transformation-definition';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {MuiNotificationService} from '@kodality-web/marina-ui';

@Component({
  selector: 'tw-transformation-definition-execution',
  templateUrl: './transformation-definition-execution.component.html',
})
export class TransformationDefinitionExecutionComponent {
  @Input() public definition: TransformationDefinition;
  public result: {result?: string, error?: string};
  public loading: boolean;

  public constructor(
    private transformationDefinitionService: TransformationDefinitionService,
    private notificationService: MuiNotificationService
  ) {}

  public evaluate(): void {
    if (!TransformationDefinition.isValid(this.definition)) {
      this.notificationService.error('core.form-invalid');
      return;
    }
    this.result = null;
    this.loading = true;
    this.transformationDefinitionService.transform(this.definition.testSource, this.definition).subscribe(r => this.result = r)
      .add(() => this.loading = false);
  }
}
