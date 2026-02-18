import {Component, Input, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { isDefined, LoadingManager, validateForm, JoinPipe, MapPipe, SplitPipe } from '@kodality-web/core-util';
import {ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';
import { MuiFormModule, MuiInputModule, MuiSelectModule, MuiDividerModule, MuiEditableTableModule } from '@kodality-web/marina-ui';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';


@Component({
    selector: 'tw-implementation-guide-version-form',
    templateUrl: 'implementation-guide-version-form.component.html',
    imports: [FormsModule, MuiFormModule, ValueSetConceptSelectComponent, MuiInputModule, SemanticVersionSelectComponent, MuiSelectModule, MuiDividerModule, MuiEditableTableModule, JoinPipe, MapPipe, SplitPipe]
})
export class ImplementationGuideVersionFormComponent {
  @Input() public version: ImplementationGuideVersion = {status: 'draft', version: '1.0.0', algorithm: 'semver', template: 'local-template', dependsOn: [], github: {}};
  @Input() public versions: ImplementationGuideVersion[] = [];

  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public getVersion(): ImplementationGuideVersion {
    return this.version;
  }
}
