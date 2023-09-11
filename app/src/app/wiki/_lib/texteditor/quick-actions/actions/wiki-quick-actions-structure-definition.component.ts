import {Component, forwardRef, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {WikiQuickActionDefinition, WikiQuickActionsBaseComponent} from './wiki-quick-actions.base';
import {StructureDefinition, StructureDefinitionLibService} from 'term-web/modeler/_lib';


@Component({
  selector: 'tw-wiki-structure-definition-action',
  template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)">
      <ng-container *m-modal-header>
        {{'web.wiki-page.texteditor.quick-actions.structure-definition-modal.header' | translate}}
      </ng-container>

      <ng-container *m-modal-content>
        <form *ngIf="data">
          <m-form-item mName="structure-definition" mLabel="web.wiki-page.texteditor.quick-actions.structure-definition-modal.structure-definition" required>
            <m-select [(ngModel)]="data.defCode" name="structure-definition" required>
              <m-option *ngFor="let sd of structureDefinitions" [mLabel]="sd.code" [mValue]="sd.code"></m-option>
            </m-select>
          </m-form-item>
        </form>
      </ng-container>

      <div *m-modal-footer class="m-items-middle">
        <m-button mDisplay="text" (click)="cancel()">{{'core.btn.close' | translate}}</m-button>
        <m-button mDisplay="primary" (click)="confirm()">{{'core.btn.confirm' | translate}}</m-button>
      </div>
    </m-modal>
  `,
  providers: [{
    provide: WikiQuickActionsBaseComponent,
    useExisting: forwardRef(() => WikiQuickActionsStructureDefinitionComponent)
  }]
})
export class WikiQuickActionsStructureDefinitionComponent extends WikiQuickActionsBaseComponent implements OnInit {
  public definition: Omit<WikiQuickActionDefinition, 'result'> = {
    id: '_md_structure-definition',
    name: 'Structure definition',
    icon: 'profile',
    description: 'Insert structure definition',
    cursorOffset: res => res.length - 2
  };

  protected data?: ModalData;
  protected modalVisible: boolean;
  protected structureDefinitions?: StructureDefinition[];
  @ViewChild(NgForm) protected form?: NgForm;

  public constructor(
    private structureDefinitionService: StructureDefinitionLibService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.structureDefinitionService.search({limit: 999}).subscribe(sd => this.structureDefinitions = sd.data);
  }


  public override handle(): void {
    this.toggleModal(true);
  }

  protected cancel(): void {
    this.toggleModal(false);
  }

  protected confirm(): void {
    if (validateForm(this.form)) {
      this.resolve.next(`{{def:${this.data.defCode}}}`);
      this.modalVisible = false;
    }
  }


  protected toggleModal(visible: boolean): void {
    if (this.modalVisible === visible) {
      return;
    }

    this.modalVisible = visible;
    if (this.modalVisible) {
      this.data = {};
    } else {
      this.resolve.next(undefined);
    }
  }
}

class ModalData {
  public defCode?: string;
}
