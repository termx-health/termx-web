import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {compareValues, isDefined, validateForm} from '@kodality-web/core-util';
import {StructureDefinition} from 'terminology-lib/thesaurus';
import {StructureDefinitionService} from '../../services/structure-definition.service';
import {Element, StructureDefinitionTreeComponent} from './structure-definition-tree.component';
import {StructureDefinitionType} from './structure-definition-type-list.component';
import {ChefService} from '../../../integration/chef/chef.service';

@Component({
  templateUrl: 'structure-definition-edit.component.html'
})
export class StructureDefinitionEditComponent implements OnInit {
  public id?: number | null;
  public structureDefinition?: StructureDefinition;

  public selectedTabIndex: number = 1;
  public pendingTabIndex?: number;
  public tabIndexMap = {fsh: 0, json: 1, element: 2};

  public element?: FormElement;
  public pendingElement?: FormElement;

  public loading: {[k: string]: boolean} = {};
  public modalData: {visible?: boolean, action?: 'addElement' | 'openElement' | 'openJson' | 'openFsh'} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild("elementForm") public elementForm?: NgForm;
  @ViewChild("sdTree") public sdTree?: StructureDefinitionTreeComponent;

  public constructor(
    private structureDefinitionService: StructureDefinitionService,
    private route: ActivatedRoute,
    private location: Location,
    private chefService: ChefService
  ) {}

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.mode = this.id ? 'edit' : 'add';

    const params = window.location.href.split('?')[1];
    if (isDefined(params) && params.includes('element')) {
      this.selectedTabIndex = 2;
    }
    if (this.mode === 'add') {
      this.structureDefinition = new StructureDefinition();
      this.structureDefinition.contentType = 'profile';
      this.structureDefinition.contentFormat = 'json';
    }

    if (this.mode === 'edit') {
      this.loading ['init'] = true;
      this.structureDefinitionService.load(this.id!).subscribe(sd => {
        this.structureDefinition = sd;
        this.selectedTabIndex = this.selectedTabIndex === 2 ? this.selectedTabIndex : this.tabIndexMap[sd.contentFormat!];
      }).add(() => this.loading ['init'] = false);
    }
  }

  public save(): void {
    if (!isDefined(this.form) && validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.structureDefinitionService.save(this.structureDefinition!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public saveElement(nextAction?: 'addElement' | 'openElement' | 'openJson' | 'openFsh'): void {
    if (!isDefined(this.elementForm) || !validateForm(this.elementForm)) {
      return;
    }
    this.loading['save'] = true;
    this.structureDefinition!.content = this.updateElementContent(this.element!, this.structureDefinition!.content);
    this.structureDefinitionService.save(this.structureDefinition!).subscribe(sd => {
      this.element = undefined;
      this.structureDefinition = sd;
      this.sdTree?.reloadTree();
      this.handleAction(nextAction);
    }).add(() => this.loading['save'] = false);
  }

  public handleTabChange(index?: number): void {
    this.pendingTabIndex = isDefined(index) && index !== 2 ? index : this.pendingTabIndex;
    if (this.isChanged(this.element)) {
      setTimeout(() => {
        this.selectedTabIndex = 2;
        this.modalData = {visible: true, action: this.pendingTabIndex === 0 ? 'openFsh' : 'openJson'};
      });
      return;
    }

    if (this.pendingTabIndex === 0) {
      const req = {};
      this.chefService.fhirToFsh(req).subscribe(resp => {
        this.structureDefinition!.content = resp.fsh;
      });
      this.structureDefinition!.contentFormat = 'fsh';
    } else {
      const req = {};
      this.chefService.fhirToFsh(req).subscribe(resp => {
        this.structureDefinition!.content = JSON.stringify(resp.fhir);
      });
      this.structureDefinition!.contentFormat = 'json';
    }
    this.selectedTabIndex = this.pendingTabIndex || index || 1;
  }

  public addElement(): void {
    if (this.isChanged(this.element)) {
      this.modalData = {visible: true, action: 'addElement'};
      return;
    }
    if (this.sdTree) {
      this.sdTree.selectedElement = undefined;
    }
    this.element = {fixedCoding: {}};
  }

  public openElementForm(element?: Element): void {
    this.pendingElement = element ? {
      id: element.id!,
      path: element.path!,
      cardinality: isDefined(element.min) || isDefined(element.max) ?
        (isDefined(element.min) ? element.min : '*') + '..' + (isDefined(element.max) ? element.max : '*') : undefined,
      short: element.short,
      definition: element.definition,
      types: element.type?.map(t => ({code: t.code, targetProfile: t.targetProfile?.map(p => ({value: p}))})) || [],
      fixedUri: element.fixedUri,
      fixedCoding: element.fixedCoding || {},
      constraint: element.constraint || []
    } : this.pendingElement;

    if (this.isChanged(this.element)) {
      this.modalData = {visible: true, action: 'openElement'};
      return;
    }
    this.element = this.pendingElement;
  }

  private updateElementContent(formElement: FormElement, content?: string): string {
    const structureDefinition = content ? JSON.parse(content) : {};
    structureDefinition.id = structureDefinition.id || this.structureDefinition?.code;
    structureDefinition.name = structureDefinition.name || this.structureDefinition?.code;
    structureDefinition.resourceType = structureDefinition.resourceType || 'StructureDefinition';
    structureDefinition.differential = structureDefinition.differential || {};
    structureDefinition.differential.element = structureDefinition.differential.element || [];
    let elements: Element[] = structureDefinition.differential.element || [];
    elements = elements.filter(el => el.id !== formElement.id);
    const element = this.composeElement(formElement);
    elements.push(element);
    elements = elements.map(el => this.cleanObject(el));
    structureDefinition.differential.element = elements;
    return JSON.stringify(structureDefinition, null, 2);
  }

  private composeElement(formElement: FormElement): Element {
    const element = new Element();
    const path = formElement.path?.startsWith(this.structureDefinition!.code! + '.') ? formElement.path :
      this.structureDefinition!.code! + '.' + formElement.path;
    element.id = path;
    element.path = path;
    const min = Number(formElement.cardinality?.split('..')[0]);
    const max = Number(formElement.cardinality?.split('..')[1]);
    element.min = isDefined(min) ? min : undefined;
    element.max = isDefined(max) ? max : undefined;
    element.short = formElement.short;
    element.definition = formElement.definition;
    element.type = formElement.types?.map(t => ({code: t.code, targetProfile: t.targetProfile?.map(p => p.value)}));
    element.fixedUri = formElement.fixedUri;
    element.fixedCoding = isDefined(formElement.fixedCoding) ? formElement.fixedCoding : undefined;
    element.constraint = formElement.constraint;
    return element;
  }

  public proceed(saveElement?: boolean): void {
    if (saveElement) {
      this.saveElement(this.modalData.action);
    } else {
      this.handleAction(this.modalData.action);
    }
    this.modalData.visible = false;
  }

  private handleAction(action: "addElement" | "openElement" | "openJson" | "openFsh" | undefined): void {
    this.element = undefined;
    if (action === 'addElement') {
      this.addElement();
    }
    if (action === 'openElement') {
      this.openElementForm();
    }
    if (action && ['openFsh', 'openJson'].includes(action)) {
      this.handleTabChange();
    }
  }

  private isChanged(element: FormElement | undefined): boolean {
    if (!isDefined(element)) {
      return false;
    }
    const structureDefinition = this.structureDefinition?.content ? JSON.parse(this.structureDefinition!.content) : {};
    const elements: Element[] = structureDefinition.differential.element || [];
    const currentElement = elements.find(el => el.id === element.id);
    return !currentElement || JSON.stringify(this.cleanObject(currentElement)) !== JSON.stringify(this.cleanObject(this.composeElement(element)));
  }

  private cleanObject(obj: any): any {
    return Object.fromEntries(Object.entries(obj)
      .filter(([_, v]) => v != null && (!(typeof v === 'number') || !isNaN(v)) && (!(v instanceof Object) || Object.keys(v).length > 0))
      .sort(([s1, _v1], [s2, _v2]) => compareValues(s1, s2))
    );
  }
}

export class FormElement {
  public id?: string;
  public path?: string;
  public cardinality?: string;
  public short?: string;
  public definition?: string;
  public types?: StructureDefinitionType[];
  public fixedUri?: string;
  public fixedCoding?: {code?: string, system?: string, display?: string};
  public constraint?: any[];
}
