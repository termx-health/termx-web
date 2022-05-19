import {Component, OnInit} from '@angular/core';
import {CodeSystemService} from '../codesystem/services/code-system.service';
import {ValueSetService} from '../valueset/services/value-set.service';
import {MapSetService} from '../mapset/services/map-set-service';

@Component({
  selector: 'twa-tabset',
  templateUrl: './resources-tabset.component.html',
})
export class ResourcesTabsetComponent implements OnInit {
  public badgeStyle = {backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset'};
  public codeSystemTotal?: number;
  public valueSetTotal?: number;
  public mapSetTotal?: number;

  public constructor(
    private codeSystemService: CodeSystemService,
    private valueSetService: ValueSetService,
    private mapSetService: MapSetService,
  ) { }

  public ngOnInit(): void {
    this.loadTotals();
  }

  public loadTotals(): void {
    this.codeSystemService.search({limit: 0}).subscribe(cs => this.codeSystemTotal = cs.meta?.total).add();
    this.valueSetService.search({limit: 0}).subscribe(vs => this.valueSetTotal = vs.meta?.total).add();
    this.mapSetService.search({limit: 0}).subscribe(ms => this.mapSetTotal = ms.meta?.total).add();
  }
}