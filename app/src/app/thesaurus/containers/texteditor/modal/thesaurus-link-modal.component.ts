import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {Location} from '@angular/common';
import {Page} from 'lib/src/thesaurus';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'twa-link-modal',
  template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)" [mMaskClosable]="false">
      <ng-container *m-modal-header>
        {{'web.thesaurus-page.link-modal.header' | translate}}
      </ng-container>

      <ng-container *m-modal-content>
        <form #form="ngForm" *ngIf="data">
          <m-form-item mName="linkName" mLabel="web.thesaurus-page.link-modal.link-name">
            <m-input [(ngModel)]="data.name" name="linkName"></m-input>
          </m-form-item>
          <m-form-item mName="type">
            <nz-radio-group name="type" [(ngModel)]="data.linkType">
              <label nz-radio-button nzValue="url">{{'web.thesaurus-page.link-modal.url' | translate}}</label>
              <label nz-radio-button nzValue="page">{{'web.thesaurus-page.link-modal.page' | translate}}</label>
              <label nz-radio-button nzValue="resource">{{'web.thesaurus-page.link-modal.resource' | translate}}</label>
            </nz-radio-group>
          </m-form-item>
          <m-form-item *ngIf="data.linkType === 'url'" mName="link" mLabel="web.thesaurus-page.link-modal.url" required>
            <m-input [(ngModel)]="data.link" name="link" required></m-input>
          </m-form-item>
          <m-form-item *ngIf="data.linkType === 'page'" mName="page" mLabel="web.thesaurus-page.link-modal.page" required>
            <twl-page-select [(ngModel)]="data.page" name="page" [valuePrimitive]="false"></twl-page-select>
          </m-form-item>
          <ng-container *ngIf="data.linkType === 'resource'">
            <m-form-item mName="resource" mLabel="web.thesaurus-page.link-modal.resource-type" required>
              <m-select [(ngModel)]="data.resourceType" name="resource" required>
                <m-option label="CodeSystem" [value]="'code-systems'"></m-option>
                <m-option label="ValueSet" [value]="'value-sets'"></m-option>
                <m-option label="MapSet" [value]="'map-sets'"></m-option>
                <m-option label="Concept" [value]="'concepts'"></m-option>
              </m-select>
            </m-form-item>
            <m-form-item *ngIf="data.resourceType === 'code-systems'" mName="codeSystem" mLabel="web.thesaurus-page.link-modal.code-system" required>
              <twl-code-system-search [(ngModel)]="data.resource" name="codeSystem" valuePrimitive required></twl-code-system-search>
            </m-form-item>
            <m-form-item *ngIf="data.resourceType === 'value-sets'" mName="valueSet" mLabel="web.thesaurus-page.link-modal.value-set" required>
              <twl-value-set-search [(ngModel)]="data.resource" name="valueSet" valuePrimitive required></twl-value-set-search>
            </m-form-item>
            <m-form-item *ngIf="data.resourceType === 'map-sets'" mName="mapSet" mLabel="web.thesaurus-page.link-modal.map-set" required>
              <twl-map-set-search [(ngModel)]="data.resource" name="mapSet" valuePrimitive required></twl-map-set-search>
            </m-form-item>
            <m-form-item *ngIf="data.resourceType === 'concepts'" mName="conceptCodeSystem" mLabel="web.thesaurus-page.link-modal.concept-code-system" required>
              <twl-code-system-search [(ngModel)]="data.conceptCodeSystem" name="conceptCodeSystem" valuePrimitive required></twl-code-system-search>
            </m-form-item>
            <m-form-item *ngIf="data.resourceType === 'concepts' && data.conceptCodeSystem" mName="concept" mLabel="web.thesaurus-page.link-modal.concept" required>
              <div *ngIf="data.conceptCodeSystem === 'snomed-ct' && data.resource">
                <label>{{data.resource}}</label><m-icon style="cursor: pointer; margin-left: 0.5rem" mCode="close" (click)="data.resource = null"></m-icon>
              </div>
              <twl-snomed-search *ngIf="data.conceptCodeSystem === 'snomed-ct' && !data.resource" (conceptSelected)="data.resource = $event"></twl-snomed-search>
              <twl-concept-search *ngIf="data.conceptCodeSystem !== 'snomed-ct'" [(ngModel)]="data.resource" [codeSystem]="data.conceptCodeSystem" name="concept" required></twl-concept-search>
            </m-form-item>
          </ng-container>

        </form>
      </ng-container>

      <div *m-modal-footer class="tw-button-group">
        <m-button mDisplay="text" (click)="toggleModal(false)">{{'core.btn.close' | translate}}</m-button>
        <m-button mDisplay="primary" (click)="confirm()">{{'core.btn.confirm' | translate}}</m-button>
      </div>
    </m-modal>
  `
})
export class ThesaurusLinkModalComponent {
  @Output() public linkComposed: EventEmitter<string> = new EventEmitter();

  public modalVisible = false;
  public data?: LinkModalData;

  @ViewChild("form") public form?: NgForm;

  public constructor(public location: Location, public translateService: TranslateService) { }

  public toggleModal(visible: boolean): void {
    this.modalVisible = visible;

    if (!this.modalVisible) {
      this.linkComposed.emit();
    }

    if (this.modalVisible) {
      this.data = {linkType: 'url'};
    }
  }

  public confirm(): void {
    if (!validateForm(this.form)) {
      return;
    }

    const link = this.composeLink(this.data!);
    this.linkComposed.emit(this.data!.name ? '[' + this.data!.name + '](' + link + ')' : link);
    this.modalVisible = false;
  }

  private composeLink(data: LinkModalData): string | undefined {
    if (data.linkType === 'url') {
      return data.link;
    }

    const path = this.location.path();
    const url = window.location.href.replace(path, '');

    if (data.linkType === 'page') {
      const content = data.page?.contents?.find(c => c.lang === this.translateService.currentLang) || data.page?.contents?.[0];
      return url + '/thesaurus/' + content!.slug;
    }

    if (data.linkType === 'resource') {
      if (data.resourceType && ['code-systems', 'value-sets', 'map-sets'].includes(data.resourceType)) {
        return url + '/resources/' + data.resourceType + '/' + data.resource + '/view';
      }
      if ('concepts' === data.resourceType && data.conceptCodeSystem !== 'snomed-ct') {
        return url + '/resources/code-systems/' + data.conceptCodeSystem + '/' + data.resourceType + '/' + data.resource!.code! + '/view';
      }
      if ('concepts' === data.resourceType && data.conceptCodeSystem === 'snomed-ct') {
        return url + '/integration/snomed';
      }
    }
  }

}

export class LinkModalData {
  public name?: string;
  public linkType?: 'url' | 'resource' | 'page';
  public link?: string;
  public page?: Page;
  public resourceType?: string;
  public resource?: any;
  public conceptCodeSystem?: string;
}
