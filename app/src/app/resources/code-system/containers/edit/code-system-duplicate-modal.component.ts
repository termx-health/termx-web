import { Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { validateForm, AutofocusDirective } from '@termx-health/core-util';
import {CodeSystemService} from 'term-web/resources/code-system/services/code-system.service';
import { MuiModalModule, MuiFormModule, MuiInputModule, MuiButtonModule } from '@termx-health/ui';

import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-code-system-duplicate-modal',
    templateUrl: './code-system-duplicate-modal.component.html',
    imports: [
    MuiModalModule,
    FormsModule,
    MuiFormModule,
    CodeSystemSearchComponent,
    AutofocusDirective,
    MuiInputModule,
    MuiButtonModule,
    TranslatePipe
],
})
export class CodeSystemDuplicateModalComponent {
  private codeSystemService = inject(CodeSystemService);

  @Output() public duplicated: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params?: {sourceCodeSystem?: string, targetCodeSystem?: string, targetUri?: string};

  @ViewChild("form") public form?: NgForm;

  public toggleModal(params?: {sourceCodeSystem: string}): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  public duplicate(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const duplicateRequest = {
      codeSystem: this.params!.targetCodeSystem,
      codeSystemUri: this.params!.targetUri
    };
    this.codeSystemService.duplicateCodeSystem(this.params!.sourceCodeSystem, duplicateRequest).subscribe(() => {
        this.modalVisible = false;
        this.duplicated.emit();
      }
    );
  }
}
