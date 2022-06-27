import {Component, OnInit} from '@angular/core';
import {CodeSystemService} from '../codesystem/services/code-system.service';
import {ValueSetService} from '../valueset/services/value-set.service';
import {MapSetService} from '../mapset/services/map-set-service';
import {NamingSystemLibService} from 'terminology-lib/resources';


@Component({
  selector: 'twa-tabset',
  templateUrl: './resources-tabset.component.html',
  styles: [`
    .tw-tab-total-tag {
      border-radius: 1.4rem;
      color: #999;

      font-size: 0.8rem;
      line-height: 1.4rem;

      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ResourcesTabsetComponent implements OnInit {
  public codeSystemTotal?: number;
  public valueSetTotal?: number;
  public mapSetTotal?: number;
  public namingSystemTotal?: number;

  public constructor(
    private codeSystemService: CodeSystemService,
    private valueSetService: ValueSetService,
    private mapSetService: MapSetService,
    private namingSystemLibService: NamingSystemLibService,
  ) { }

  public ngOnInit(): void {
    this.loadTotals();
  }

  public loadTotals(): void {
    this.codeSystemService.search({limit: 0}).subscribe(cs => this.codeSystemTotal = cs.meta?.total).add();
    this.valueSetService.search({limit: 0}).subscribe(vs => this.valueSetTotal = vs.meta?.total).add();
    this.mapSetService.search({limit: 0}).subscribe(ms => this.mapSetTotal = ms.meta?.total).add();
    this.namingSystemLibService.search({limit: 0}).subscribe(ns => this.namingSystemTotal = ns.meta?.total).add();
  }
}
