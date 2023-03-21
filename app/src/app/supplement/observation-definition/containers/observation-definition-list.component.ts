import {Component, OnInit} from '@angular/core';
import {copyDeep, LoadingManager, SearchResult} from '@kodality-web/core-util';
import {ObservationDefinitionService} from '../services/observation-definition.service';
import {ObservationDefinition, ObservationDefinitionSearchParams} from 'term-web/supplement/_lib';

@Component({
  templateUrl: 'observation-definition-list.component.html'
})
export class ObservationDefinitionListComponent implements OnInit {
  protected searchResult = SearchResult.empty<ObservationDefinition>();
  protected query = new ObservationDefinitionSearchParams();
  protected loader = new LoadingManager();

  public constructor(
    private observationDefinitionService: ObservationDefinitionService
  ) { }

  public ngOnInit(): void {
    this.search();
  }

  protected search(): void {
    const q = copyDeep(this.query);

    this.loader.wrap('load', this.observationDefinitionService.search(q)).subscribe(resp => {
      this.searchResult = resp;
    });
  }
}
