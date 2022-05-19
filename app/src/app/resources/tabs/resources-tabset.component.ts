import {Component, OnInit} from '@angular/core';
import {CodeSystemService} from '../codesystem/services/code-system.service';
import {ValueSetService} from '../valueset/services/value-set.service';
import {CodeSystemSearchParams} from 'terminology-lib/resources';

@Component({
  selector: 'twa-tabset',
  templateUrl: './resources-tabset.component.html',
})
export class ResourcesTabsetComponent implements OnInit{
  public badgeStyle = { backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' };
  public codeSystemTotal?: number;
  public valueSetTotal?: number;


  public constructor(
    private codeSystemService: CodeSystemService,
    private valueSetService: ValueSetService,
    ) { }


  public ngOnInit(): void {
    this.loadTotal();
  }

  public loadTotal(): void{
    const csQuery = new CodeSystemSearchParams();
    const vsQuery = new CodeSystemSearchParams();
    csQuery.limit = 0;
    vsQuery.limit = 0;

    this.codeSystemService.search(csQuery).subscribe(cs => this.codeSystemTotal = cs.meta?.total).add();
    this.valueSetService.search(vsQuery).subscribe(vs => this.valueSetTotal = vs.meta?.total).add();
  }
}
