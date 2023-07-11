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
  public output: string;
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
    this.output = null;
    this.loading = true;
    this.transformationDefinitionService.transform(this.definition.testSource, this.definition).subscribe(r => this.output = r)
      .add(() => this.loading = false);
  }
}
