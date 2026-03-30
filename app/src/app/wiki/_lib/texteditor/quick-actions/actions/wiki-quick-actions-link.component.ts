import { Component, forwardRef, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { validateForm, AutofocusDirective } from '@termx-health/core-util';
import {PreferencesService} from 'term-web/core/preferences/preferences.service';
import {Space} from 'term-web/sys/_lib/space';
import {PageContent} from 'term-web/wiki/_lib/page/models/page-content';
import {WikiQuickActionDefinition, WikiQuickActionsBaseComponent} from 'term-web/wiki/_lib/texteditor/quick-actions/actions/wiki-quick-actions.base';
import { MuiModalModule, MuiFormModule, MuiInputModule, MuiRadioModule, MuiCoreModule, MuiSelectModule, MuiIconModule, MuiButtonModule } from '@termx-health/ui';

import { SpaceSelectComponent } from 'term-web/sys/_lib/space/containers/space-select.component';
import { PageContentSelectComponent } from 'term-web/wiki/_lib/page/components/page-content-select.component';
import { CodeSystemSearchComponent } from 'term-web/resources/_lib/code-system/containers/code-system-search.component';
import { ValueSetSearchComponent } from 'term-web/resources/_lib/value-set/containers/value-set-search.component';
import { MapSetSearchComponent } from 'term-web/resources/_lib/map-set/containers/map-set-search.component';
import { TerminologyConceptSearchComponent } from 'term-web/core/ui/components/inputs/terminology-concept-select/terminology-concept-search.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-wiki-link-action',
    template: `
    <m-modal #modal [(mVisible)]="modalVisible" (mClose)="toggleModal(false)">
      <ng-container *m-modal-header>
        {{'web.wiki-page.texteditor.quick-actions.link-modal.header' | translate}}
      </ng-container>
    
      <ng-container *m-modal-content>
        @if (data) {
          <form>
            <m-form-item mName="linkName" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.link-name" required>
              <m-input [(ngModel)]="data.name" name="linkName" required/>
            </m-form-item>
            <m-form-item mName="type">
              <m-radio-group name="type" [(ngModel)]="data.linkType">
                <label m-radio-button mValue="url">{{'web.wiki-page.texteditor.quick-actions.link-modal.url' | translate}}</label>
                <label m-radio-button mValue="page">{{'web.wiki-page.texteditor.quick-actions.link-modal.page' | translate}}</label>
                <label m-radio-button mValue="resource">{{'web.wiki-page.texteditor.quick-actions.link-modal.resource' | translate}}</label>
              </m-radio-group>
            </m-form-item>
            @switch (data.linkType) {
              @case ('url') {
                <m-form-item mName="link" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.url" required>
                  <m-input [(ngModel)]="data.link" name="link" required/>
                </m-form-item>
              }
              @case ('page') {
                <m-form-row>
                  @if ({spaceSelectVisible: false}; as d) {
                    @if (d.spaceSelectVisible) {
                      <m-form-item *mFormCol mName="space" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.space">
                        <tw-space-select [(ngModel)]="data.space" name="space" autofocus/>
                      </m-form-item>
                    }
                    <m-form-item *mFormCol mName="page" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.page" required>
                      <tw-page-content-select [(ngModel)]="data.pageContent" name="page" [spaceId]="data.space?.id ?? preferences.spaceId" required/>
                      @if (!d.spaceSelectVisible) {
                        <a (mClick)="d.spaceSelectVisible = true" style="font-size: 0.85rem">
                          {{'web.wiki-page.texteditor.quick-actions.link-modal.search-externally' | translate}}
                        </a>
                      }
                    </m-form-item>
                  }
                </m-form-row>
              }
              @case ('resource') {
                <m-form-item mName="resource" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.resource-type" required>
                  <m-select [(ngModel)]="data.resourceType" name="resource" required>
                    <m-option mLabel="CodeSystem" [mValue]="'cs'"/>
                    <m-option mLabel="ValueSet" [mValue]="'vs'"/>
                    <m-option mLabel="MapSet" [mValue]="'ms'"/>
                    <m-option mLabel="Concept" [mValue]="'concept'"/>
                  </m-select>
                </m-form-item>
                @if (data.resourceType === 'cs') {
                  <m-form-item mName="codeSystem" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.code-system" required>
                    <tw-code-system-search [(ngModel)]="data.resource" name="codeSystem" valuePrimitive required/>
                  </m-form-item>
                }
                @if (data.resourceType === 'vs') {
                  <m-form-item mName="valueSet" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.value-set" required>
                    <tw-value-set-search [(ngModel)]="data.resource" name="valueSet" valuePrimitive required/>
                  </m-form-item>
                }
                @if (data.resourceType === 'ms') {
                  <m-form-item mName="mapSet" mLabel="web.wiki-page.texteditor.quick-actions.link-modal.map-set" required>
                    <tw-map-set-search [(ngModel)]="data.resource" name="mapSet" valuePrimitive required/>
                  </m-form-item>
                }
                @if (data.resourceType === 'concept') {
                  <m-form-item
                    mName="conceptCodeSystem"
                    mLabel="web.wiki-page.texteditor.quick-actions.link-modal.concept-code-system"
                    required
                    >
                    <tw-code-system-search [(ngModel)]="data.conceptCodeSystem" name="conceptCodeSystem" valuePrimitive required/>
                  </m-form-item>
                }
                @if (data.resourceType === 'concept' && data.conceptCodeSystem) {
                  <m-form-item
                    mName="concept"
                    mLabel="web.wiki-page.texteditor.quick-actions.link-modal.concept"
                    required
                    >
                    @if (data.conceptCodeSystem === 'snomed-ct' && data.resource) {
                      <div>
                        <label>{{data.resource}}</label>
                        <m-icon style="cursor: pointer; margin-left: 0.5rem" mCode="close" (click)="data.resource = null"></m-icon>
                      </div>
                    }
                    <tw-term-concept-search [(ngModel)]="data.resource"
                      [codeSystem]="data.conceptCodeSystem"
                      valueType="code"
                      name="concept"
                      required
                    ></tw-term-concept-search>
                  </m-form-item>
                }
              }
            }
          </form>
        }
      </ng-container>
    
      <div *m-modal-footer class="m-items-middle">
        <m-button mDisplay="text" (click)="cancel()">{{'core.btn.close' | translate}}</m-button>
        <m-button mDisplay="primary" (click)="confirm()">{{'core.btn.confirm' | translate}}</m-button>
      </div>
    </m-modal>
    `,
    providers: [{
            provide: WikiQuickActionsBaseComponent,
            useExisting: forwardRef(() => WikiQuickActionsLinkComponent)
        }],
    imports: [MuiModalModule, FormsModule, MuiFormModule, MuiInputModule, MuiRadioModule, SpaceSelectComponent, AutofocusDirective, PageContentSelectComponent, MuiCoreModule, MuiSelectModule, CodeSystemSearchComponent, ValueSetSearchComponent, MapSetSearchComponent, MuiIconModule, TerminologyConceptSearchComponent, MuiButtonModule, TranslatePipe]
})
export class WikiQuickActionsLinkComponent extends WikiQuickActionsBaseComponent {
  protected preferences = inject(PreferencesService);

  public definition: Omit<WikiQuickActionDefinition, 'result'> = {
    id: '_md_link',
    name: 'Link',
    icon: 'link',
    description: 'Insert a link'
  };

  protected data: LinkModalData;
  protected modalVisible: boolean;
  @ViewChild(NgForm) private form?: NgForm;

  public override handle(): void {
    this.toggleModal(true);
  }


  protected toggleModal(visible: boolean): void {
    if (this.modalVisible === visible) {
      return;
    }

    this.modalVisible = visible;
    if (this.modalVisible) {
      this.data = {linkType: 'url'};
    } else {
      this.resolve.next(undefined);
    }
  }

  protected cancel(): void {
    this.toggleModal(false);
  }

  protected confirm(): void {
    if (!validateForm(this.form)) {
      return;
    }

    const link = this.composePageRelationLink(this.data);
    this.resolve.next(this.data.name ? `[${this.data.name}](${link})` : link);

    this.modalVisible = false;
  }


  private composePageRelationLink(data: LinkModalData): string | undefined {
    switch (data.linkType) {
      case 'url':
        return data.link;
      case 'page':
        return `page:${data.space ? data.space.code + '/' : ''}${data.pageContent.slug}`;
      case 'resource':
        switch (data.resourceType) {
          case 'cs':
          case 'vs':
          case 'ms':
            return `${data.resourceType}:${data.resource}`;
          case 'csv':
            return `${data.resourceType}:${data.versionCodeSystem}|${data.resource}`;
          case 'vsv':
            return `${data.resourceType}:${data.versionValueSet}|${data.resource}`;
          case 'msv':
            return `${data.resourceType}:${data.versionMapSet}|${data.resource}`;
          case 'concept':
            return `${data.resourceType}:${data.conceptCodeSystem}|${data.resource}`;
        }
    }
  }
}

export class LinkModalData {
  public name?: string;
  public linkType?: 'url' | 'resource' | 'page';
  public link?: string;
  public pageContent?: PageContent;
  public space?: Space;
  public resourceType?: 'cs' | 'csv' | 'vs' | 'vsv' | 'ms' | 'msv' | 'concept';
  public resource?: any;
  public conceptCodeSystem?: string;
  public versionCodeSystem?: string;
  public versionValueSet?: string;
  public versionMapSet?: string;
}
