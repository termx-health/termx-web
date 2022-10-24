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
          <m-form-item mName="type" required>
            <nz-radio-group name="type" [(ngModel)]="data.sourceType" required>
              <label nz-radio-button nzValue="structure-definition">{{'web.thesaurus-page.structure-definition-modal.structure-definition' | translate}}</label>
              <label nz-radio-button nzValue="simplifier">{{'web.thesaurus-page.structure-definition-modal.simplifier' | translate}}</label>
            </nz-radio-group>
          </m-form-item>
          <m-form-item *ngIf="data.sourceType === 'simplifier'" mName="url" mLabel="web.thesaurus-page.structure-definition-modal.url" required>
            <m-input [(ngModel)]="data.url" name="url" required></m-input>
          </m-form-item>
          <m-form-item *ngIf="data.sourceType === 'simplifier'" mName="baseDefinitionUrl" mLabel="web.thesaurus-page.structure-definition-modal.base-definition-url">
            <m-input [(ngModel)]="data.baseDefinitionUrl" name="baseDefinitionUrl"></m-input>
          </m-form-item>
          <m-form-item *ngIf="data.sourceType" mName="structure-definition" mLabel="web.thesaurus-page.structure-definition-modal.structure-definition" [required]="data.sourceType === 'structure-definition'">
            <m-select [(ngModel)]="data.structureDefinitionCode" name="structure-definition">
              <m-option *ngFor="let sd of structureDefinitions" [label]="sd.code" [value]="sd.code"></m-option>
            </m-select>
          </m-form-item>
        </form>
      </ng-container>

      <div *m-modal-footer class="tw-button-group">
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
  public data?: LinkModalData;

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
      this.data = {sourceType: 'structure-definition'};
    }
  }

  public confirm(): void {
    if (!validateForm(this.form)) {
      return;
    }

    this.structureDefinitionComposed.emit(this.composeStructureDefinition(this.data!));
    this.modalVisible = false;
  }

  private composeStructureDefinition(data: LinkModalData): string | undefined {
    if (data.sourceType === 'simplifier') {
      const source = data.baseDefinitionUrl ? "|base-definitionUrl:" + data.baseDefinitionUrl : data.structureDefinitionCode ? "|def:" + data.structureDefinitionCode : "";
      return "{{simplifier:" + data.url + source +"}}";
    }
    if (data.sourceType === 'structure-definition') {
      return "{{def:" + data.structureDefinitionCode +"}}";
    }
    return;
  }

  private loadStructureDefinitions(): void {
    this.structureDefinitionService.search({limit: 999}).subscribe(sd => this.structureDefinitions = sd.data);
  }
}

export class LinkModalData {
  public sourceType?: 'simplifier' | 'structure-definition';
  public url?: string;
  public structureDefinitionCode?: string;
  public baseDefinitionUrl?: string;
}
