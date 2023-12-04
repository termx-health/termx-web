import {Component, OnInit, ViewChild} from '@angular/core';
import {ComponentStateStore, copyDeep, DestroyService, isDefined, LoadingManager, QueryParams, SearchResult, validateForm} from '@kodality-web/core-util';
import {ObservationDefinitionService} from '../services/observation-definition.service';
import {ObservationDefinition, ObservationDefinitionImportRequest, ObservationDefinitionSearchParams} from 'app/src/app/observation-definition/_lib';
import {Observable, tap} from 'rxjs';
import {NgForm} from '@angular/forms';
import {JobLibService, JobLog} from 'term-web/sys/_lib';
import {MuiNotificationService, MuiTableComponent} from '@kodality-web/marina-ui';
import {CodeSystemConcept} from 'term-web/resources/_lib';
import {LocalizedName} from '@kodality-web/marina-util';

interface Filter {
  open: boolean,
  searchInput?: string,

  categories?: {code: string, codeSystem: string}[],
  structure?: string[],
  valueType?: string[]
}

@Component({
  templateUrl: 'observation-definition-list.component.html',
  providers: [DestroyService]
})
export class ObservationDefinitionListComponent implements OnInit {
  private readonly STORE_KEY = 'observation-definition-list';

  protected query = new ObservationDefinitionSearchParams();
  protected searchResult = SearchResult.empty<ObservationDefinition>();
  protected filter: Filter = {open: false};
  protected _filter: Omit<Filter, 'open'> = this.filter; // temp, use only in tw-table-filter
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;
  @ViewChild(MuiTableComponent) public table?: MuiTableComponent<CodeSystemConcept>;

  protected jobResponse: JobLog;
  protected importData: {
    visible?: boolean,
    loincCodes?: string[]
  } = {visible: false};

  public constructor(
    private observationDefinitionService: ObservationDefinitionService,
    private stateStore: ComponentStateStore,
    private jobService: JobLibService,
    private notificationService: MuiNotificationService,
    private destroy$: DestroyService,
  ) { }

  public ngOnInit(): void {
    const state = this.stateStore.pop(this.STORE_KEY);
    if (state) {
      this.query = Object.assign(new QueryParams(), state.query);
      this.filter = state.filter;
    }

    this.loadData();
  }

  protected loadData(): void {
    this.search().subscribe(resp => this.searchResult = resp);
  }

  protected onDebounced = (): Observable<SearchResult<ObservationDefinition>> => {
    this.query.offset = 0;
    return this.search().pipe(tap(resp => this.searchResult = resp));
  };

  protected onFilterOpen(): void {
    this.filter.open = true;
    this._filter = structuredClone(this.filter); // copy 'active' to 'temp'
  }

  protected onFilterSearch(): void {
    this.filter = {...structuredClone(this._filter)} as Filter; // copy 'temp' to 'active'
    this.query.offset = 0;
    this.loadData();
  }

  protected onFilterReset(): void {
    this.filter = {open: this.filter.open};
    this._filter = structuredClone(this.filter);
  }

  private search(): Observable<SearchResult<ObservationDefinition>> {
    const q = copyDeep(this.query);
    q.categories = this.filter.categories?.map(c => c.codeSystem + '|' + c.code).join(',') || undefined;
    q.structures = this.filter.structure?.join(',') || undefined;
    q.types = this.filter.valueType?.join(',') || undefined;
    q.textContains = this.filter.searchInput || undefined;
    q.decorated = true;
    this.stateStore.put(this.STORE_KEY, {query: q, filter: this.filter});

    return this.loader.wrap('load', this.observationDefinitionService.search(q));
  }


  // import

  protected startImport(): void {
    if (!validateForm(this.form)) {
      return;
    }

    const request: ObservationDefinitionImportRequest = {loincCodes: this.importData.loincCodes};
    this.loader.wrap('import', this.observationDefinitionService.import(request)).subscribe(resp => {
      this.importData = {};
      this.pollJobStatus(resp.jobId);
    });
  }

  private pollJobStatus(jobId: number): void {
    this.loader.wrap('import', this.jobService.pollFinishedJobLog(jobId, this.destroy$)).subscribe(jobResp => {
      if (!jobResp.errors && !jobResp.warnings) {
        this.notificationService.success("web.observation-definition.import-success-message", '', {duration: 0, closable: true});
      }
      this.jobResponse = jobResp;
      this.loadData();
    });
  }


  // utils

  protected isFilterSelected(filter: Filter): boolean {
    const exclude: (keyof Filter)[] = ['open', 'searchInput'];
    return Object.keys(filter)
      .filter((k: keyof Filter) => !exclude.includes(k))
      .some(k => Array.isArray(filter[k]) ? !!filter[k].length : isDefined(filter[k]));
  }

  protected getDetails = (obs: ObservationDefinition): {code: string, names?: LocalizedName, cs?: string}[] => {
    let details = [];
    details = [...details, ...(obs.value?.valueSet ? [{code: obs.value.valueSet}] : [])];
    details = [...details, ...(obs.value?.values ? obs.value.values.map(v => ({code: v.code, cs: v.codeSystem})) : [])];
    obs.members?.forEach(m => details.push({code: m.item.code, names: m.item.names}));
    obs.components?.forEach(c => details.push({code: c.code, names: c.names}));
    return details;
  };

  protected getProtocol = (obs: ObservationDefinition): {label: string, tooltip: any}[] => {
    const details = [];
    if (['values', 'value-set'].includes(obs.protocol?.device?.usage)) {
      details.push({label: 'device', tooltip: obs.protocol.device.values?.map(v => v.code)?.join(',') || obs.protocol.device.valueSet});
    }
    if (['values', 'value-set'].includes(obs.protocol?.method?.usage)) {
      details.push({label: 'method', tooltip: obs.protocol.method.values?.map(v => v.code)?.join(',') || obs.protocol.method.valueSet});
    }
    if (['values', 'value-set'].includes(obs.protocol?.measurementLocation?.usage)) {
      details.push({
        label: 'measurement-location',
        tooltip: obs.protocol.measurementLocation.values?.map(v => v.code)?.join(',') || obs.protocol.measurementLocation.valueSet
      });
    }
    if (['values', 'value-set'].includes(obs.protocol?.specimen?.usage)) {
      details.push({label: 'specimen', tooltip: obs.protocol.specimen.values?.map(v => v.code)?.join(',') || obs.protocol.specimen.valueSet});
    }
    if (['values', 'value-set'].includes(obs.protocol?.position?.usage)) {
      details.push({label: 'position', tooltip: obs.protocol.position.values?.map(v => v.code)?.join(',') || obs.protocol.position.valueSet});
    }
    if (['values', 'value-set'].includes(obs.protocol?.dataCollectionCircumstances?.usage)) {
      details.push({
        label: 'data-collection-circumstances',
        tooltip: obs.protocol.dataCollectionCircumstances.values?.map(v => v.code)?.join(',') || obs.protocol.dataCollectionCircumstances.valueSet
      });
    }
    obs.protocol?.components?.forEach(c => details.push({label: c.code, tooltip: c.names}));
    return details;
  };

  protected showExpandRow(obs: ObservationDefinition, i: number, type: string): void {
    if (obs['_expanded']) {
      this.table.collapse(i);
    } else {
      this.table.expand(i);
    }
    obs['_expanded'] = !obs['_expanded'];
    obs['_expandType'] = type;
  }
}
