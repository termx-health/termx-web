import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { validateForm, AutofocusDirective } from '@termx-health/core-util';
import {CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { MuiModalModule, MuiFormModule, MuiButtonModule } from '@termx-health/ui';

import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { CodeSystemVersionSelectComponent } from 'term-web/resources/_lib/code-system/containers/code-system-version-select.component';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-code-system-version-duplicate-modal',
    templateUrl: './code-system-version-duplicate-modal.component.html',
    imports: [
    MuiModalModule,
    FormsModule,
    MuiFormModule,
    CodeSystemSearchComponent,
    AutofocusDirective,
    CodeSystemVersionSelectComponent,
    SemanticVersionSelectComponent,
    MuiButtonModule,
    TranslatePipe
],
})
export class CodeSystemVersionDuplicateModalComponent {
  private codeSystemService = inject(CodeSystemService);

  @Output() public duplicated: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params?: {targetCodeSystem?: string, targetVersion?: string, sourceCodeSystem?: string, sourceVersion?: CodeSystemVersion};

  @ViewChild("form") public form?: NgForm;

  public toggleModal(params?: {targetCodeSystem: string, sourceCodeSystem?: string, sourceVersion?: CodeSystemVersion}): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  public duplicate(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const duplicateRequest = {codeSystem: this.params!.targetCodeSystem, version: this.params!.targetVersion};
    this.codeSystemService.duplicateCodeSystemVersion(this.params!.sourceCodeSystem, this.params!.sourceVersion!.version, duplicateRequest).subscribe(() => {
        this.duplicated.emit();
        this.modalVisible = false;
      }
    );
  }

}
