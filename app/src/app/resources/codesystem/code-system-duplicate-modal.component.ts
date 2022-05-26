import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {CodeSystemService} from './services/code-system.service';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';


@Component({
  selector: 'twa-code-system-duplicate-modal',
  templateUrl: './code-system-duplicate-modal.component.html',
})
export class CodeSystemDuplicateModalComponent {
  @Output() public duplicated: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public sourceCodeSystem?: string;
  public targetCodeSystem?: string;
  public targetUri?: string;

  @ViewChild("form") public form?: NgForm;

  public constructor(private codeSystemService: CodeSystemService) { }

  public toggleModal(codeSystem?: string): void {
    this.modalVisible = !this.modalVisible;
    this.sourceCodeSystem = codeSystem;
  }

  public duplicate(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const duplicateRequest = {codeSystem: this.targetCodeSystem!, codeSystemUri: this.targetUri!};
    this.codeSystemService.duplicateCodeSystem(this.sourceCodeSystem!, duplicateRequest).subscribe(() => {
        this.modalVisible = false;
        this.duplicated.emit();
      }
    );
  }

}
