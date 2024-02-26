import {Location} from '@angular/common';
import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {forkJoin, takeUntil} from 'rxjs';
import {
  ObservationDefinition,
  ObservationDefinitionComponent,
  ObservationDefinitionProtocol,
  ObservationDefinitionProtocolValue,
  ObservationDefinitionUnit,
  ObservationDefinitionValue
} from 'term-web/observation-definition/_lib';
import {
  ObservationDefinitionComponentListComponent
} from 'term-web/observation-definition/containers/edit/component/observation-definition-component-list.component';
import {
  ObservationDefinitionInterpretationListComponent
} from 'term-web/observation-definition/containers/edit/interpretation/observation-definition-interpretation-list.component';
import {ObservationDefinitionMappingListComponent} from 'term-web/observation-definition/containers/edit/mapping/observation-definition-mapping-list.component';
import {ObservationDefinitionMemberListComponent} from 'term-web/observation-definition/containers/edit/member/observation-definition-member-list.component';
import {ObservationDefinitionProtocolComponent} from 'term-web/observation-definition/containers/edit/protocol/observation-definition-protocol.component';
import {ObservationDefinitionValueComponent} from 'term-web/observation-definition/containers/edit/value/observation-definition-value.component';
import {ObservationDefinitionService} from 'term-web/observation-definition/services/observation-definition.service';
import {CodeSystemLibService} from 'term-web/resources/_lib';

@Component({
  templateUrl: './observation-definition-edit.component.html',
  providers: [DestroyService]
})
export class ObservationDefinitionEditComponent implements OnInit {
  protected observationDefinition?: ObservationDefinition;
  protected loader = new LoadingManager();
  protected category: {codeSystem?: string, code?: string} = {codeSystem: 'observation-category'};

  @ViewChild("form") public form?: NgForm;
  @ViewChild(ObservationDefinitionValueComponent) public valueComponent?: ObservationDefinitionValueComponent;
  @ViewChild(ObservationDefinitionMemberListComponent) public memberListComponent?: ObservationDefinitionMemberListComponent;
  @ViewChildren(ObservationDefinitionComponentListComponent) public componentListComponents?: QueryList<ObservationDefinitionComponentListComponent>;
  @ViewChild(ObservationDefinitionProtocolComponent) public protocolComponent?: ObservationDefinitionProtocolComponent;
  @ViewChild(ObservationDefinitionInterpretationListComponent) public interpretationListComponent?: ObservationDefinitionInterpretationListComponent;
  @ViewChild(ObservationDefinitionMappingListComponent) public mappingListComponent?: ObservationDefinitionMappingListComponent;

  public constructor(
    private observationDefinitionService: ObservationDefinitionService,
    private codeSystemService: CodeSystemLibService,
    private route: ActivatedRoute,
    private destroy$: DestroyService,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loader.wrap('load', this.observationDefinitionService.load(Number(id))).subscribe(obs => this.writeObservationDefinition(obs));
      } else {
        this.writeObservationDefinition(new ObservationDefinition());
      }
    });
  }

  protected save(): void {
    if (!this.validate()) {
      return;
    }
    this.loader.wrap('save', this.observationDefinitionService.save(this.observationDefinition!)).subscribe(() => this.location.back());
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form)
      && (!isDefined(this.valueComponent) || this.valueComponent.validate())
      && (!isDefined(this.memberListComponent) || this.memberListComponent.validate())
      && (!isDefined(this.componentListComponents) || !this.componentListComponents.find(c => !c.validate()))
      && (!isDefined(this.protocolComponent) || this.protocolComponent.validate())
      && (!isDefined(this.interpretationListComponent) || this.interpretationListComponent.validate())
      && (!isDefined(this.mappingListComponent) || this.mappingListComponent.validate());
  }

  private writeObservationDefinition(obs: ObservationDefinition): void {
    obs.version ??= '1';
    obs.status ??= 'draft';
    obs.timePrecision ??= 'timestamp';
    obs.structure ??= ['value'];
    obs.keywords ??= [];
    obs.value ??= new ObservationDefinitionValue();
    obs.value.unit ??= new ObservationDefinitionUnit();
    obs.members ??= [];
    obs.components ??= [];
    obs.protocol ??= new ObservationDefinitionProtocol();
    obs.protocol.device ??= new ObservationDefinitionProtocolValue();
    obs.protocol.device.usage ??= 'not-in-use';
    obs.protocol.method ??= new ObservationDefinitionProtocolValue();
    obs.protocol.method.usage ??= 'not-in-use';
    obs.protocol.measurementLocation ??= new ObservationDefinitionProtocolValue();
    obs.protocol.measurementLocation.usage ??= 'not-in-use';
    obs.protocol.specimen ??= new ObservationDefinitionProtocolValue();
    obs.protocol.specimen.usage ??= 'not-in-use';
    obs.protocol.position ??= new ObservationDefinitionProtocolValue();
    obs.protocol.position.usage ??= 'not-in-use';
    obs.protocol.dataCollectionCircumstances ??= new ObservationDefinitionProtocolValue();
    obs.protocol.dataCollectionCircumstances.usage ??= 'not-in-use';
    obs.protocol.components ??= [];
    obs.state ??= [];
    obs.interpretations ??= [];
    obs.mappings ??= [];

    this.observationDefinition = obs;
  }

  public publisherChanged(publisher: string): void {
    if (!publisher) {
      return;
    }
    forkJoin([
      this.codeSystemService.searchProperties('publisher', {names: 'uri'}),
      this.codeSystemService.loadConcept('publisher', publisher)
    ]).subscribe(([prop, c]) => {
      const activeVersion = c.versions?.find(v => v.status === 'active');
      if (activeVersion) {
        const url = activeVersion.propertyValues?.find(pv => prop.data.map(p => p.id).includes(pv.entityPropertyId))?.value;
        this.observationDefinition.url = url && this.observationDefinition.code && this.observationDefinition.version ?
          url + '/ObservationDefinition/' + this.observationDefinition.code + '/v/' + this.observationDefinition.version :
          this.observationDefinition!.url;
      }
    });
  }

  protected extractComponents = (def: ObservationDefinition): ObservationDefinitionComponent[] => {
    if (!isDefined(def)) {
      return [];
    }
    return [...(def.components || []), ...(def.state || []), ...(def.protocol.components || []),];
  };

  public removeCategory(index: number): void {
    this.observationDefinition.category?.splice(index, 1);
    this.observationDefinition.category = [...this.observationDefinition.category];
  }

  public addCategory(code: string, system: string): void {
    if (!code || !system) {
      return;
    }
    this.observationDefinition.category = [...(this.observationDefinition.category || []), {code: code, codeSystem: system}];
    setTimeout(() => {
      this.category.code = undefined;
    });
  }
}
