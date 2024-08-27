import {Component, Input} from '@angular/core';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {TransformationDefinitionService} from 'term-web/modeler/transformer/services/transformation-definition.service';
import {TransformationDefinition} from '../../_lib/transformer/transformation-definition';

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
      this.result.error = r.error?.replace("Transformation error: ", '');
      setTimeout(() => {
        document.getElementById('resultEl')?.scrollIntoView({behavior: 'smooth'});
        window['Prism'].highlightAll();
      });
    }).add(() => this.loading = false);
  }
}
