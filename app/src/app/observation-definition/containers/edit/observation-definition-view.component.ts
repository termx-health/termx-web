import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {ObservationDefinition} from 'term-web/observation-definition/_lib';
import {ObservationDefinitionService} from 'term-web/observation-definition/services/observation-definition.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule } from '@kodality-web/marina-ui';

import { FormsModule } from '@angular/forms';

@Component({
    templateUrl: './observation-definition-view.component.html',
    imports: [
    MuiFormModule,
    MuiSpinnerModule,
    MuiCardModule,
    FormsModule
],
})
export class ObservationDefinitionViewComponent implements OnInit {
  private observationDefinitionService = inject(ObservationDefinitionService);
  private route = inject(ActivatedRoute);

  protected observationDefinition?: ObservationDefinition;
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loader.wrap('load', this.observationDefinitionService.load(id)).subscribe(obs => this.observationDefinition = obs);
  }
}
