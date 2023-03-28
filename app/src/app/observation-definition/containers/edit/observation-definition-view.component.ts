import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {ObservationDefinition} from '../../_lib';
import {ObservationDefinitionService} from '../../services/observation-definition.service';

@Component({
  templateUrl: './observation-definition-view.component.html',
})
export class ObservationDefinitionViewComponent implements OnInit {
  protected observationDefinition?: ObservationDefinition;
  protected loader = new LoadingManager();

  public constructor(
    private observationDefinitionService: ObservationDefinitionService,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loader.wrap('load', this.observationDefinitionService.load(id)).subscribe(obs => this.observationDefinition = obs);
  }
}
