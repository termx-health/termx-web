import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';


@Component({
  selector: 'twa-code-system-duplicate-modal',
  templateUrl: './code-system-duplicate-modal.component.html',
})
export class CodeSystemDuplicateModalComponent {
  @Output() public duplicated: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params?: {sourceCodeSystem?: string, targetCodeSystem?: string, targetUri?: string};

  @ViewChild("form") public form?: NgForm;

  public constructor(private codeSystemService: CodeSystemService) { }

  public toggleModal(params?: {sourceCodeSystem: string}): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  public duplicate(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const duplicateRequest = {
      codeSystem: this.params?.targetCodeSystem!,
      codeSystemUri: this.params?.targetUri!
    };
    this.codeSystemService.duplicateCodeSystem(this.params?.sourceCodeSystem!, duplicateRequest).subscribe(() => {
        this.toggleModal();
        this.duplicated.emit();
      }
    );
  }
}
