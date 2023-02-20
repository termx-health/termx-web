import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {TranslateService} from '@ngx-translate/core';
import {StructureDefinition, StructureDefinitionLibService} from 'terminology-lib/thesaurus';


@Component({
  selector: 'twa-structure-definition-modal',
  template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)" [mMaskClosable]="false">
      <ng-container *m-modal-header>
        {{'web.thesaurus-page.structure-definition-modal.header' | translate}}
      </ng-container>

      <ng-container *m-modal-content>
        <form #form="ngForm" *ngIf="data">
          <m-form-item mName="structure-definition" mLabel="web.thesaurus-page.structure-definition-modal.structure-definition" required>
            <m-select [(ngModel)]="data.defCode" name="structure-definition" required>
              <m-option *ngFor="let sd of structureDefinitions" [mLabel]="sd.code" [mValue]="sd.code"></m-option>
            </m-select>
          </m-form-item>
        </form>
      </ng-container>

      <div *m-modal-footer class="m-items-middle">
        <m-button mDisplay="text" (click)="toggleModal(false)">{{'core.btn.close' | translate}}</m-button>
        <m-button mDisplay="primary" (click)="confirm()">{{'core.btn.confirm' | translate}}</m-button>
      </div>
    </m-modal>
  `
})
export class ThesaurusStructureDefinitionModalComponent implements OnInit {
  @Output() public structureDefinitionComposed: EventEmitter<string> = new EventEmitter();

  public modalVisible = false;
  public structureDefinitions?: StructureDefinition[];
  public data?: ModalData;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    public translateService: TranslateService,
    public structureDefinitionService: StructureDefinitionLibService
  ) {}

  public ngOnInit(): void {
    this.loadStructureDefinitions();
  }

  public toggleModal(visible: boolean): void {
    if (this.modalVisible === visible) {
      return;
    }
    this.modalVisible = visible;

    if (!this.modalVisible) {
      this.structureDefinitionComposed.emit();
    }

    if (this.modalVisible) {
      this.data = {};
    }
  }

  public confirm(): void {
    if (!validateForm(this.form)) {
      return;
    }

    this.structureDefinitionComposed.emit(this.composeStructureDefinition(this.data!));
    this.modalVisible = false;
  }

  private composeStructureDefinition(data: ModalData): string | undefined {
    return "{{def:" + data.defCode +"}}";
  }

  private loadStructureDefinitions(): void {
    this.structureDefinitionService.search({limit: 999}).subscribe(sd => this.structureDefinitions = sd.data);
  }
}

export class ModalData {
  public defCode?: string;
}
