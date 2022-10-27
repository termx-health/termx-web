import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {StructureDefinition} from 'terminology-lib/thesaurus';
import {StructureDefinitionService} from '../../services/structure-definition.service';
import {Element, StructureDefinitionTreeComponent} from './structure-definition-tree.component';
import {StructureDefinitionType} from './structure-definition-type-list.component';



@Component({
  templateUrl: 'structure-definition-edit.component.html'
})
export class StructureDefinitionEditComponent implements OnInit {
  public id?: number | null;
  public structureDefinition?: StructureDefinition;

  public element?: FormElement;

  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild("elementForm") public elementForm?: NgForm;
  @ViewChild("sdTree") public sdTree?: StructureDefinitionTreeComponent;

  public constructor(
    private structureDefinitionService: StructureDefinitionService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.mode = this.id ? 'edit' : 'add';

    if (this.mode === 'add') {
      this.structureDefinition = new StructureDefinition();
      this.structureDefinition.contentType = 'profile';
      this.structureDefinition.contentFormat = 'json';
    }

    if (this.mode === 'edit') {
      this.loading ['init'] = true;
      this.structureDefinitionService.load(this.id!).subscribe(sd => this.structureDefinition = sd).add(() => this.loading ['init'] = false);
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

  public saveElement(): void {
    if (!isDefined(this.elementForm) && validateForm(this.elementForm)) {
      return;
    }
    this.loading['save'] = true;
    this.structureDefinition!.content = this.updateElementContent(this.element!, this.structureDefinition!.content);
    this.structureDefinitionService.save(this.structureDefinition!).subscribe(sd => {
      this.element = undefined;
      this.structureDefinition = sd;
      this.sdTree?.reloadTree();
    }).add(() => this.loading['save'] = false);
  }

  public handleFormat(contentFormat: 'json' | 'fsh'): void {
    this.structureDefinition!.contentFormat = contentFormat;
  }

  public openForm(element: Element): void {
    if (element) {
      this.element = {
        id: element.id!,
        path: element.path!,
        name: element.id!.split(/\.|:/).pop()!,
        cardinality: isDefined(element.min) || isDefined(element.max) ? (isDefined(element.min) ? element.min : '*') + '..' + (isDefined(element.max) ? element.max : '*') : undefined,
        short: element.short,
        definition: element.definition,
        types: element.type?.map(t => ({code: t.code, targetProfile: t.targetProfile?.map(p => ({value: p}))})) || [],
        fixedUri: element.fixedUri,
        fixedCoding: element.fixedCoding || {},
        constraint: element.constraint || []
      };
    }
  }

  public addElement(): void {
    this.element = {fixedCoding: {}};
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
    const element = new Element();
    element.id = formElement.path;
    element.path = formElement.path;
    const min = Number(formElement.cardinality?.split('..')[0]);
    const max = Number(formElement.cardinality?.split('..')[1]);
    element.min = isDefined(min) ? min : undefined;
    element.max = isDefined(max) ? max : undefined;
    element.short = formElement.short;
    element.definition = formElement.definition;
    element.type = formElement.types?.map(t => ({code: t.code, targetProfile: t.targetProfile?.map(p => p.value)}));
    element.fixedUri = formElement.fixedUri;
    element.fixedCoding = formElement.fixedCoding;
    element.constraint = formElement.constraint;
    elements.push(element);
    structureDefinition.differential.element = elements;
    return JSON.stringify(structureDefinition, null, 2);
  }
}

export class FormElement {
  public id?: string;
  public name?: string;
  public path?: string;
  public cardinality?: string;
  public short?: string;
  public definition?: string;
  public types?: StructureDefinitionType[];
  public fixedUri?: string;
  public fixedCoding?: {code?: string, system?: string, display?: string};
  public constraint?: any[];
}
