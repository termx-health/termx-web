import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {BooleanInput, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {MuiTreeSelectNodeOptions} from '@kodality-web/marina-ui';
import {StructureDefinition, StructureDefinitionLibService} from 'term-web/modeler/_lib';
import {CodeSystemEntityVersion, CodeSystemLibService, ConceptUtil} from 'term-web/resources/_lib';


@Component({
  selector: 'tw-sd-type-list',
  templateUrl: './structure-definition-type-list.component.html',
  styles: [`
    .tw-sd-type-collapse ::ng-deep {

      .ant-collapse-header {
        align-items: center;
      }

      .ant-collapse-content-box {
        padding: 0;
      }

      .m-table {
        border-radius: 0 0 4px 4px;
      }
    }
  `]
})
export class StructureDefinitionTypeListComponent implements OnInit{
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public types!: StructureDefinitionType[];
  @Output() public typesChange: EventEmitter<StructureDefinitionType[]> = new EventEmitter<StructureDefinitionType[]>();

  public modalData: {
    kind?: string,
    visible?: boolean,
    index?: number,
    type?: StructureDefinitionType
  } = {};

  protected primitives: MuiTreeSelectNodeOptions[];
  protected dataTypes: MuiTreeSelectNodeOptions[];
  protected resources: MuiTreeSelectNodeOptions[];
  protected termXDefinitions: StructureDefinition[];

  protected referenceTypes: string[] = ['Reference', 'CodeableReference', 'canonical'];

  @ViewChild("form") public form?: NgForm;

  public constructor(private codeSystemService: CodeSystemLibService, private sdService: StructureDefinitionLibService) {}

  public ngOnInit(): void {
    this.codeSystemService.searchConcepts('fhir-types', {limit: -1}).subscribe(r => {
      const primitive = r.data.map(c => ConceptUtil.getLastVersion(c)).filter(v =>
        v.propertyValues.find(pv => pv.entityProperty === 'kind' && pv.value === 'primitive'));
      this.primitives = primitive.filter(p => !p.associations || p.associations.length === 0 || !p.associations.find(a => primitive.find(p1 => p1.code === a.targetCode)))
        .map(dt => this.toTreeNode(dt, primitive));

      const dataTypes = r.data.map(c => ConceptUtil.getLastVersion(c)).filter(v => v.code !== 'Element' &&
        v.propertyValues.find(pv => pv.entityProperty === 'kind' && pv.value === 'datatype'));
      this.dataTypes = dataTypes.filter(dt => !dt.associations || dt.associations.length === 0 || !dt.associations.find(a => dataTypes.find(dt1 => dt1.code === a.targetCode)))
        .map(dt => this.toTreeNode(dt, dataTypes));

      const resources = r.data.map(c => ConceptUtil.getLastVersion(c)).filter(v => v.code !== 'Resource' &&
        v.propertyValues.find(pv => pv.entityProperty === 'kind' && pv.value === 'resource'));
      this.resources =  resources.filter(res => !res.associations || res.associations.length === 0 || !res.associations.find(a => resources.find(res1 => res1.code === a.targetCode)))
        .map(res => this.toTreeNode(res, resources));
    });

    this.sdService.search({limit:-1}).subscribe(r => this.termXDefinitions = r.data);
  }

  public addType(): void {
    this.types = [...this.types || []];
    this.toggleModal({});
  }

  public removeType(index: number): void {
    this.types.splice(index, 1);
    this.types = [...this.types];
    this.typesChange.emit(this.types);
  }


  public toggleModal(type?: StructureDefinitionType, index?: number): void {
    this.modalData = {
      visible: !!type,
      type: copyDeep(type),
      index: index
    };
  }

  public addModalTarget(): void {
    this.modalData.type!.targetProfile = [...(this.modalData.type!.targetProfile || []), {value: ''}];
  }

  public removeModalTarget(index: number): void {
    this.modalData.type!.targetProfile!.splice(index, 1);
    this.modalData.type!.targetProfile = [...this.modalData.type!.targetProfile!];
  }

  public confirmModalType(): void {
    if (!validateForm(this.form)) {
      return;
    }
    if (!this.referenceTypes.includes(this.modalData.type.code)) {
      this.modalData.type.targetProfile = [];
    }

    if (isDefined(this.modalData.index)) {
      this.types[this.modalData.index!] = this.modalData.type!;
    } else {
      this.types = [...this.types, this.modalData.type!];
    }

    this.typesChange.emit(this.types);
    this.modalData.visible = false;
  }

  private toTreeNode(ver: CodeSystemEntityVersion, allVersions: CodeSystemEntityVersion[]): MuiTreeSelectNodeOptions {
    const children = allVersions.filter(v => v.associations?.find(a => a.targetCode === ver.code));
    return {title: ver.code, key: ver.code, expanded: true, disabled: ver.code !== 'BackboneElement' && !!ver.propertyValues.find(pv => pv.entityProperty === 'abstract-type' && pv.value === true),
      children: children.map(c => this.toTreeNode(c, allVersions)), isLeaf: !children || children.length === 0};
  }
}

export class StructureDefinitionType {
  public code?: string;
  public targetProfile?: {value: string}[];
  public profile?: {value: string}[];
}

