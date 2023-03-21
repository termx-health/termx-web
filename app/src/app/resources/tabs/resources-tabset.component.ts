import {Component, OnInit} from '@angular/core';
import {AuthService} from 'term-web/core/auth';
import {AssociationTypeLibService, CodeSystemLibService, MapSetLibService, NamingSystemLibService, ValueSetLibService} from 'term-web/resources/_lib';


@Component({
  selector: 'tw-tabset',
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
  public associationTypeTotal?: number;

  public constructor(
    private authService: AuthService,
    private codeSystemService: CodeSystemLibService,
    private valueSetService: ValueSetLibService,
    private mapSetService: MapSetLibService,
    private namingSystemService: NamingSystemLibService,
    private associationTypeService: AssociationTypeLibService
  ) { }

  public ngOnInit(): void {
    this.loadTotals();
  }

  public loadTotals(): void {
    if (this.authService.hasPrivilege('*.CodeSystem.view')) {
      this.codeSystemService.search({limit: 0}).subscribe(cs => this.codeSystemTotal = cs.meta?.total);
    }
    if (this.authService.hasPrivilege('*.ValueSet.view')) {
      this.valueSetService.search({limit: 0}).subscribe(vs => this.valueSetTotal = vs.meta?.total);
    }
    if (this.authService.hasPrivilege('*.MapSet.view')) {
      this.mapSetService.search({limit: 0}).subscribe(ms => this.mapSetTotal = ms.meta?.total);
    }
    if (this.authService.hasPrivilege('*.NamingSystem.view')) {
      this.namingSystemService.search({limit: 0}).subscribe(ns => this.namingSystemTotal = ns.meta?.total);
    }
    if (this.authService.hasPrivilege('*.AssociationType.view')) {
      this.associationTypeService.search({limit: 0}).subscribe(at => this.associationTypeTotal = at.meta?.total);
    }
  }
}
