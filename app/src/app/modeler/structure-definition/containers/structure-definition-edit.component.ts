import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {compareValues, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {Fhir} from 'fhir/fhir';
import {map, Observable, of} from 'rxjs';
import {ChefService} from 'term-web/integration/_lib';
import {StructureDefinition, StructureDefinitionEditableTreeComponent, StructureDefinitionUtil} from 'term-web/modeler/_lib';
import {Element} from 'term-web/modeler/_lib/structure-definition/structure-definition-editable-tree.component';
import {StructureDefinitionType} from '../components/structure-definition-type-list.component';
import {StructureDefinitionService} from '../services/structure-definition.service';

@Component({
  templateUrl: 'structure-definition-edit.component.html'
})
export class StructureDefinitionEditComponent implements OnInit {
  public id?: number | null;
  public structureDefinition: StructureDefinition;
  public contentFsh: string;
  public contentFhir: string;

  public selectedTabIndex: number = 0;
  public prevTabIndex: number = 0;
  public pendingTabIndex?: number;
  public tabIndexMap = {fsh: 1, json: 2, element: 3};

  public element?: Element;
  public formElement?: FormElement;

  protected loader = new LoadingManager();
  public modalData: {visible?: boolean, action?: 'openJson' | 'openFsh'} = {};
  public errorModalData: {visible?: boolean, title?: string, messages?: string[], pendingIndex?: number} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild("fshForm") public fshForm?: NgForm;
  @ViewChild("jsonForm") public jsonForm?: NgForm;
  @ViewChild("elementForm") public elementForm?: NgForm;
  @ViewChild("sdTree") public sdTree?: StructureDefinitionEditableTreeComponent;

  public constructor(
    private structureDefinitionService: StructureDefinitionService,
    private notificationService: MuiNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private chefService: ChefService
  ) {}

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.mode = this.id ? 'edit' : 'add';

    const params = window.location.href.split('?')[1];
    if (isDefined(params) && params.includes('element')) {
      this.selectedTabIndex = this.tabIndexMap['element'];
    }
    if (this.mode === 'add') {
      this.structureDefinition = new StructureDefinition();
      this.structureDefinition.contentType = 'logical';
      this.structureDefinition.contentFormat = 'json';
      this.contentFsh = '';
      this.contentFhir = '';
    }

    if (this.mode === 'edit') {
      this.loader.wrap('init', this.structureDefinitionService.load(this.id!)).subscribe(sd => {
        this.structureDefinition = sd;
        this.loader.wrap('init', this.unmapContent(sd.content, sd.contentFormat)).subscribe();
        this.selectedTabIndex = this.selectedTabIndex === this.tabIndexMap['element'] ? this.selectedTabIndex : this.tabIndexMap[sd.contentFormat!];
      });
    }
  }

  private unmapContent(content: string, format: 'fsh' | 'json'): Observable<void> {
    if (format == 'json') {
      if (content.startsWith('<')) {
        content = String(new Fhir().xmlToObj(content));
      }
      if (content.startsWith('{')) {
        return this.chefService.fhirToFsh({fhir: [content]}).pipe(map(r => {
          this.showErrors(r, 'FHIR to FSH');
          this.contentFhir = content;
          this.contentFsh = typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
        }));
      }
    }
    if (format == 'fsh') {
      return this.chefService.fshToFhir({fsh: content}).pipe(map(r => {
        this.showErrors(r, 'FSH to FHIR');
        this.contentFsh = content;
        this.contentFhir = JSON.stringify(r.fhir[0], null, 2);
      }));
    }
  }

  private mapContent(fhir: any, format: 'fsh' | 'json'): Observable<string> {
    if (format == 'json') {
      return of(JSON.stringify(fhir, null, 2));
    }
    if (format == 'fsh') {
      return this.chefService.fhirToFsh({fhir: [fhir]}).pipe(map(r => {
        this.showErrors(r, 'FHIR to FSH');
        return typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
      }));
    }
  }

  public save(type: 'fsh' | 'json'): void {
    this.validate(this.structureDefinition);
    if (isDefined(this.form) && !validateForm(this.form) ||
      isDefined(this.fshForm) && !validateForm(this.fshForm) ||
      isDefined(this.jsonForm) && !validateForm(this.jsonForm)) {
      return;
    }
    if (type === 'fsh') {
      this.loader.wrap('save', this.chefService.fshToFhir({fsh: this.contentFsh})).subscribe(r => {
        this.showErrors(r, 'FSH to FHIR', true);
        if (!(r.errors?.length > 0)) {
          this.saveSD(JSON.stringify(r.fhir[0]));
        }
      });
    }
    if (type === 'json') {
      this.saveSD(this.contentFhir);
    }
  }

  private validate(sd: StructureDefinition): void {
    if (!sd.code.match(/^[A-Z]([A-Za-z0-9_]){1,254}$/g)) {
      this.notificationService.warning('Invalid code', 'The sequence of alphanumeric characters up to 64 symbols in Pascal case is expected. You may use this name at your own risk.');
    }
    if (!sd.url.match(/^[^|# ]+$/g)) {
      this.notificationService.warning('Invalid URL', 'URL should not contain | or # - these characters make processing canonical references problematic');
    }
  }

  public saveSD(jsonSD: string): void {
    const sd = jsonSD ? JSON.parse(jsonSD) : {};
    if (isDefined(this.structureDefinition?.code) && isDefined(sd?.id) && this.structureDefinition.code !== sd?.id) {
      StructureDefinitionUtil.changeId(sd.id, this.structureDefinition.code, sd.differential?.element);
      StructureDefinitionUtil.changeId(sd.id, this.structureDefinition.code, sd.snapshot?.element);
    }

    this.loader.wrap('save', this.mapContent(this.getFhirSD(JSON.stringify(sd)), this.structureDefinition.contentFormat)).subscribe(c => {
      this.structureDefinition.content = c;
      this.loader.wrap('save', this.structureDefinitionService.save(this.structureDefinition)).subscribe(sd => {
        this.router.navigate(['/modeler/structure-definitions', sd.id, 'edit']);
        this.loader.wrap('init', this.unmapContent(sd.content, sd.contentFormat)).subscribe();
      });
    });
  }

  public saveTreeData(nextAction?: 'openJson' | 'openFsh'): void {
    if (this.formElement) {
      this.embedElement(this.formElement, this.element);
    }

    const prevId = JSON.parse(this.sdTree.getFhirSD())?.id;
    if (this.structureDefinition?.code !== prevId) {
      this.sdTree.changeElementId(prevId, this.structureDefinition.code);
    }

    this.loader.wrap('save', this.mapContent(this.getFhirSD(this.sdTree.getFhirSD()), this.structureDefinition.contentFormat)).subscribe(content => {
      this.structureDefinition.content = content;
      this.loader.wrap('save', this.structureDefinitionService.save(this.structureDefinition!)).subscribe(sd => {
        this.formElement = undefined;
        this.structureDefinition = sd;
        this.loader.wrap('init', this.unmapContent(sd.content, sd.contentFormat)).subscribe();
        this.handleAction(nextAction);
      });
    });
  }

  public handleTabChange(index?: number): void {
    this.pendingTabIndex = index = (index || this.pendingTabIndex || 0);

    if (!isDefined(this.selectedTabIndex) || this.tabIndexMap['element'] !== this.prevTabIndex) {
      this.selectedTabIndex = index;
      this.prevTabIndex = index;
      return;
    }

    this.isChanged().subscribe(changed => {
      if (!changed) {
        this.selectedTabIndex = index;
        this.prevTabIndex = index;
        return;
      }
      this.modalData = {visible: true, action: this.pendingTabIndex === this.tabIndexMap['fsh'] ? 'openFsh' : 'openJson'};
    });
  }

  public proceedAfterError(index: number): void {
    this.structureDefinition!.content = undefined;
    this.selectedTabIndex = index;
    this.errorModalData.visible = false;
  }

  private getFhirSD(sd: string): any {
    const structureDefinition = sd ? JSON.parse(sd) : {};
    structureDefinition.id = this.structureDefinition?.code;
    structureDefinition.name = this.structureDefinition?.code;
    structureDefinition.resourceType ||= 'StructureDefinition';
    structureDefinition.kind = this.structureDefinition?.contentType;
    structureDefinition.url = this.structureDefinition?.url;
    structureDefinition.type = this.structureDefinition.contentFormat === 'json' ? this.structureDefinition?.url : undefined;
    structureDefinition.parent = this.structureDefinition?.parent;
    structureDefinition.version = this.structureDefinition?.version;
    structureDefinition.fhirVersion = '5.0.0';
    structureDefinition.abstract = false;
    structureDefinition.baseDefinition ||= 'http://hl7.org/fhir/StructureDefinition/Element';
    structureDefinition.derivation = 'specialization';
    structureDefinition.differential ||= {};
    structureDefinition.differential.element = this.prepareElements(structureDefinition.differential.element, structureDefinition.id);
    return structureDefinition;
  }

  public openElementForm(element: Element): void {
    if (isDefined(this.elementForm) && !validateForm(this.elementForm)) {
      return;
    }
    if (this.formElement) {
      this.embedElement(this.formElement, this.element);
    }

    this.element = element;
    this.formElement = this.toFormElement(element);
  }

  public closeElementForm(id: string): void {
    if (this.formElement && this.formElement._id === id) {
      this.formElement = undefined;
    }
  }

  private toFormElement(element: Element): FormElement {
    return {
      _id: element.id,
      id: element.path.split('.')[element.path.split('.').length - 1],
      path: element.path.split('.').slice(0, element.path.split('.').length - 1).join('.'),
      cardinality: isDefined(element.min) || isDefined(element.max) ?
        (isDefined(element.min) ? element.min : '*') + '..' + (isDefined(element.max) ? element.max : '*') : '0..1',
      short: element.short,
      definition: element.definition,
      types: element.type?.map(t => ({
        code: t.code,
        targetProfile: t.targetProfile?.map(p => ({value: p})),
        profile: t.profile?.map(p => ({value: p}))
      })) || [],
      fixedUri: element.fixedUri,
      fixedCoding: element.fixedCoding || {},
      binding: element.binding || {},
      constraint: element.constraint || []
    };
  }

  private fromFormElement(formElement: FormElement, currentElement?: Element): Element {
    const element = Object.assign(new Element(), currentElement);
    element.path = formElement.path + '.' + formElement.id;
    const min = Number(formElement.cardinality?.split('..')[0]);
    const max = formElement.cardinality?.split('..')[1];
    element.min = isDefined(min) ? min : undefined;
    element.max = isDefined(max) ? max : undefined;
    element.short = formElement.short;
    element.definition = formElement.definition;
    element.type = formElement.types?.map(t => ({
      code: t.code,
      targetProfile: t.targetProfile?.map(p => p.value),
      profile: t.profile?.map(p => p.value)
    }));
    element.fixedUri = formElement.fixedUri;
    element.fixedCoding = isDefined(formElement.fixedCoding) ? formElement.fixedCoding : undefined;
    element.binding = isDefined(formElement.binding) ? formElement.binding : element.binding;
    element.constraint = formElement.constraint;
    return element;
  }

  public proceed(saveSd?: boolean): void {
    if (saveSd) {
      this.saveTreeData(this.modalData.action);
    } else {
      this.handleAction(this.modalData.action);
    }
    this.modalData.visible = false;
  }

  private handleAction(action: 'openJson' | 'openFsh' | undefined): void {
    this.formElement = undefined;
    if (action && ['openFsh', 'openJson'].includes(action)) {
      this.handleTabChange();
    }
  }

  private isChanged(): Observable<boolean> {
    if (!this.sdTree?.getFhirSD()) {
      return of(false);
    }
    return this.mapContent(this.getFhirSD(this.sdTree.getFhirSD()), 'json').pipe(map(content => content !== this.contentFhir));
  }

  private cleanObject(obj: any): any {
    return Object.fromEntries(Object.entries(obj)
      .filter(([_, v]) => v != null && (!(typeof v === 'number') || !isNaN(v)) && (!(v instanceof Object) || Object.keys(v).length > 0))
      .sort(([s1, _v1], [s2, _v2]) => compareValues(s1, s2))
    );
  }

  public contentFormatChanged(format: 'json' | 'fsh' | undefined): void {
    if (format === 'json') {
      this.structureDefinition.content = this.contentFhir;
    }
    if (format === 'fsh') {
      this.structureDefinition.content = this.contentFsh;
    }
  }

  private prepareElements(elements: Element[], sdId: string): any {
    elements = elements || [];
    const defEl = elements.find(el => el.id && !el.id.includes('.'));
    if (!defEl) {
      elements.push({id: sdId, path: sdId});
    }
    return elements.map(el => this.cleanObject(el));
  }

  private showErrors(r: any, pref: string, errorsOnly?: boolean): void {
    if (!errorsOnly) {
      r.warnings?.forEach(w => this.notificationService.warning(pref + ' conversion warning', w.message!, {duration: 0, closable: true}));
    }
    r.errors?.forEach(e => this.notificationService.error(pref + ' conversion failed!', e.message!, {duration: 0, closable: true}));
  }

  private embedElement(formElement: FormElement, currentElement: Element): void {
    const el = this.fromFormElement(formElement, currentElement);
    if (!el.type || el.type.length === 0) {
      this.notificationService.warning('Form validation', 'Element "' + el.path + '" has no defined types. Define element type to prevent errors.');
    }
    this.sdTree.embedElement(el);

    this.sdTree.changeElementId(el.id, el.path);
  }
}

export class FormElement {
  public _id?: string;
  public id?: string;
  public path?: string;
  public cardinality?: string;
  public short?: string;
  public definition?: string;
  public types?: StructureDefinitionType[];
  public fixedUri?: string;
  public fixedCoding?: {code?: string, system?: string, display?: string};
  public binding?: {valueSet?: string, strength?: string};
  public constraint?: any[];
}
