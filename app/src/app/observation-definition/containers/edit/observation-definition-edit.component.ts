import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {
  ObservationDefinition,
  ObservationDefinitionProtocol,
  ObservationDefinitionUnit,
  ObservationDefinitionValue
} from 'term-web/observation-definition/_lib';
import {ObservationDefinitionService} from 'term-web/observation-definition/services/observation-definition.service';
import {forkJoin} from 'rxjs';
import {CodeSystemLibService} from 'term-web/resources/_lib';

@Component({
  templateUrl: './observation-definition-edit.component.html',
})
export class ObservationDefinitionEditComponent implements OnInit {
  protected observationDefinition?: ObservationDefinition;
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private observationDefinitionService: ObservationDefinitionService,
    private codeSystemService: CodeSystemLibService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loader.wrap('load', this.observationDefinitionService.load(id)).subscribe(obs => this.writeObservationDefinition(obs));
    } else {
      this.writeObservationDefinition(new ObservationDefinition());
    }
  }

  protected save(): void {
    if (!this.validate()) {
      return;
    }
    this.loader.wrap('save',  this.observationDefinitionService.save(this.observationDefinition!)).subscribe(() => this.location.back());
  }

  private validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
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

}
