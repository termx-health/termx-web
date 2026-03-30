import {Component, OnInit, ViewChild, inject} from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {compareValues, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiNotificationService, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiTextareaModule, MuiSelectModule, MuiRadioModule, MuiIconModule, MuiSpinnerModule, MuiModalModule, MuiTooltipModule, MarinPageLayoutModule} from '@kodality-web/marina-ui';
import {catchError, map, Observable, of, forkJoin} from 'rxjs';
import {Fhir} from 'fhir/fhir';
import {ChefService} from 'term-web/integration/_lib';
import {StructureDefinition, StructureDefinitionVersion, StructureDefinitionEditableTreeComponent, StructureDefinitionUtil} from 'term-web/modeler/_lib';
import {Element} from 'term-web/modeler/_lib/structure-definition/structure-definition-editable-tree.component';
import {StructureDefinitionType, StructureDefinitionTypeListComponent} from 'term-web/modeler/structure-definition/components/structure-definition-type-list.component';
import {StructureDefinitionConstraintListComponent} from 'term-web/modeler/structure-definition/components/structure-definition-constraint-list.component';
import {StructureDefinitionService} from 'term-web/modeler/structure-definition/services/structure-definition.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {PrivilegeContextDirective} from 'term-web/core/auth/privileges/privilege-context.directive';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';
import {NzRowDirective, NzColDirective} from 'ng-zorro-antd/grid';
import {NzInputGroupComponent, NzInputDirective} from 'ng-zorro-antd/input';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
    templateUrl: 'structure-definition-version-content.component.html',
    imports: [
      ResourceContextComponent, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiTextareaModule,
      MuiSelectModule, MuiRadioModule, MuiIconModule, MuiSpinnerModule, MuiModalModule, MuiTooltipModule, MarinPageLayoutModule,
      FormsModule, PrivilegeContextDirective, PrivilegedDirective, TranslatePipe,
      NzRowDirective, NzColDirective, NzInputGroupComponent, NzInputDirective,
      StructureDefinitionEditableTreeComponent, StructureDefinitionTypeListComponent, StructureDefinitionConstraintListComponent
    ]
})
export class StructureDefinitionVersionContentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private structureDefinitionService = inject(StructureDefinitionService);
  private chefService = inject(ChefService);
  private notificationService = inject(MuiNotificationService);

  protected structureDefinition?: StructureDefinition;
  protected versions?: StructureDefinitionVersion[];
  protected version?: StructureDefinitionVersion;
  protected contentFsh?: string;
  protected contentFhir?: string;
  protected contentMode: 'elements' | 'fsh' | 'json' = 'elements';
  protected loader = new LoadingManager();

  protected element?: Element;
  protected formElement?: FormElement;
  public modalData: {visible?: boolean} = {};
  public errorModalData: {visible?: boolean, title?: string, messages?: string[], pendingAction?: string} = {};

  @ViewChild("fshForm") public fshForm?: NgForm;
  @ViewChild("jsonForm") public jsonForm?: NgForm;
  @ViewChild("elementForm") public elementForm?: NgForm;
  @ViewChild("sdTree") public sdTree?: StructureDefinitionEditableTreeComponent;

  public ngOnInit(): void {
    this.route.data.subscribe(d => this.contentMode = d['contentMode'] || 'elements');
    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id'));
      const versionCode = pm.get('versionCode');
      this.loadData(id, versionCode);
    });
  }

  protected loadData(id: number, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([
        this.structureDefinitionService.load(id),
        this.structureDefinitionService.loadVersion(id, versionCode),
        this.structureDefinitionService.listVersions(id)
      ])
    ).subscribe(([sd, version, versions]) => {
      this.structureDefinition = sd;
      this.version = version;
      this.versions = versions;
      const contentObs = this.unmapContent(version.content, version.contentFormat as 'fsh' | 'json');
      if (contentObs) {
        this.loader.wrap('content', contentObs).pipe(
          catchError(err => {
            this.notificationService.error('Failed to process content', err?.error?.message || err?.message || 'Unknown error');
            return of(undefined);
          })
        ).subscribe();
      }
    });
  }

  private unmapContent(content: string | null | undefined, format: 'fsh' | 'json'): Observable<void> | undefined {
    if (content == null || content === '') return undefined;
    if (format === 'json') {
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
    if (format === 'fsh') {
      const fsh = StructureDefinitionVersionContentComponent.addFshElementDefaults(content);
      return this.chefService.fshToFhir({fsh}).pipe(map(r => {
        this.showErrors(r, 'FSH to FHIR');
        this.contentFsh = content;
        this.contentFhir = JSON.stringify(r.fhir[0], null, 2);
      }));
    }
    return undefined;
  }

  /**
   * Auto-adds missing short/definition strings to FSH AddElementRule lines.
   * e.g. `* a1 0..1 string` → `* a1 0..1 string "a1" "a1"`
   */
  private static addFshElementDefaults(fsh: string): string {
    // Matches AddElementRule: * <name> <card> <type(s)> without trailing quoted strings
    // e.g. `* a1 0..1 string` or `* a1 0..* string or integer`
    return fsh.replace(
      /^(\*\s+\S+\s+\d+\.\.\S+\s+(?:\S+(?:\s+or\s+\S+)*))\s*$/gm,
      (match, rule) => {
        // Already has quoted strings — skip
        if (/"/.test(match)) return match;
        // Extract element name (first token after *)
        const name = rule.match(/^\*\s+(\S+)/)?.[1] || '';
        return `${rule} "${name}" "${name}"`;
      }
    );
  }

  private mapContent(fhir: any, format: 'fsh' | 'json'): Observable<string> {
    if (format === 'json') {
      return of(JSON.stringify(fhir, null, 2));
    }
    if (format === 'fsh') {
      return this.chefService.fhirToFsh({fhir: [fhir]}).pipe(map(r => {
        this.showErrors(r, 'FHIR to FSH');
        return typeof r.fsh === 'string' ? r.fsh : JSON.stringify(r.fsh, null, 2);
      }));
    }
    return of('');
  }

  public save(type: 'fsh' | 'json'): void {
    if (isDefined(this.fshForm) && !validateForm(this.fshForm) ||
      isDefined(this.jsonForm) && !validateForm(this.jsonForm)) {
      return;
    }
    if (type === 'fsh') {
      this.version.content = this.contentFsh;
      this.loader.wrap('save', this.structureDefinitionService.saveVersion(this.structureDefinition.id, this.version)).subscribe(ver => {
        this.version = ver;
        this.loader.wrap('content', this.unmapContent(ver.content, ver.contentFormat as 'fsh' | 'json')).subscribe();
      });
    }
    if (type === 'json') {
      this.saveSD(this.contentFhir);
    }
  }

  public saveSD(jsonSD: string): void {
    const sd = jsonSD ? JSON.parse(jsonSD) : {};
    if (isDefined(this.structureDefinition?.code) && isDefined(sd?.id) && this.structureDefinition.code !== sd?.id) {
      StructureDefinitionUtil.changeId(sd.id, this.structureDefinition.code, sd.differential?.element);
      StructureDefinitionUtil.changeId(sd.id, this.structureDefinition.code, sd.snapshot?.element);
    }

    this.loader.wrap('save', this.mapContent(this.getFhirSD(JSON.stringify(sd)), this.version.contentFormat as 'fsh' | 'json')).subscribe(c => {
      this.version.content = c;
      this.loader.wrap('save', this.structureDefinitionService.saveVersion(this.structureDefinition.id, this.version)).subscribe(ver => {
        this.version = ver;
        this.loader.wrap('content', this.unmapContent(ver.content, ver.contentFormat as 'fsh' | 'json')).subscribe();
      });
    });
  }

  public saveTreeData(): void {
    if (this.formElement) {
      this.embedElement(this.formElement, this.element);
    }

    const prevId = JSON.parse(this.sdTree.getFhirSD())?.id;
    if (this.structureDefinition?.code !== prevId) {
      this.sdTree.changeElementId(prevId, this.structureDefinition.code);
    }

    this.loader.wrap('save', this.mapContent(this.getFhirSD(this.sdTree.getFhirSD()), this.version.contentFormat as 'fsh' | 'json')).subscribe(content => {
      this.version.content = content;
      this.loader.wrap('save', this.structureDefinitionService.saveVersion(this.structureDefinition.id, this.version)).subscribe(ver => {
        this.formElement = undefined;
        this.version = ver;
        this.loader.wrap('content', this.unmapContent(ver.content, ver.contentFormat as 'fsh' | 'json')).subscribe();
      });
    });
  }

  private getFhirSD(sd: string): any {
    const structureDefinition = sd ? JSON.parse(sd) : {};
    structureDefinition.id = this.structureDefinition?.code;
    structureDefinition.name = this.structureDefinition?.code;
    structureDefinition.resourceType ||= 'StructureDefinition';
    structureDefinition.kind = this.version?.contentType;
    structureDefinition.url = this.structureDefinition?.url;
    structureDefinition.type = this.version?.contentFormat === 'json' ? this.structureDefinition?.url : undefined;
    structureDefinition.parent = this.structureDefinition?.parent;
    structureDefinition.version = this.version?.version;
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

  private embedElement(formElement: FormElement, currentElement: Element): void {
    const el = this.fromFormElement(formElement, currentElement);
    if (!el.type || el.type.length === 0) {
      this.notificationService.warning('Form validation', 'Element "' + el.path + '" has no defined types. Define element type to prevent errors.');
    }
    this.sdTree.embedElement(el);
    this.sdTree.changeElementId(el.id, el.path);
  }

  private prepareElements(elements: Element[], sdId: string): any {
    elements = elements || [];
    const defEl = elements.find(el => el.id && !el.id.includes('.'));
    if (!defEl) {
      elements.push({id: sdId, path: sdId});
    }
    elements.forEach(el => {
      if (el.id?.includes('.')) {
        const name = el.id.split('.').pop();
        el.short ||= name;
        el.definition ||= name;
      }
    });
    return elements.map(el => this.cleanObject(el));
  }

  private cleanObject(obj: any): any {
    return Object.fromEntries(Object.entries(obj)
      .filter(([_, v]) => v != null && (!(typeof v === 'number') || !isNaN(v)) && (!(v instanceof Object) || Object.keys(v).length > 0))
      .sort(([s1, _v1], [s2, _v2]) => compareValues(s1, s2))
    );
  }

  private showErrors(r: any, pref: string, errorsOnly?: boolean): void {
    if (!errorsOnly) {
      r.warnings?.forEach(w => this.notificationService.warning(pref + ' conversion warning', w.message!, {duration: 0, closable: true}));
    }
    r.errors?.forEach(e => this.notificationService.error(pref + ' conversion failed!', e.message!, {duration: 0, closable: true}));
  }

  public copyContent(content: string): void {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        this.notificationService.success('Copied to clipboard');
      });
    }
  }

  public downloadContent(content: string, format: 'fsh' | 'json'): void {
    if (!content) return;
    const ext = format === 'json' ? 'json' : 'fsh';
    const name = this.structureDefinition?.code || 'structure-definition';
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public proceedAfterError(): void {
    this.version!.content = undefined;
    this.errorModalData.visible = false;
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
