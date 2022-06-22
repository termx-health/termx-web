import {Component, Input, OnInit} from '@angular/core';
import {EntityProperty} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {EntityPropertySearchParams} from 'terminology-lib/resources/codesystem/model/entity-property-search-params';
import {copyDeep} from '@kodality-web/core-util';


@Component({
  selector: 'twa-code-system-properties-list',
  templateUrl: './code-system-properties-list.component.html',
})
export class CodeSystemPropertiesListComponent implements OnInit {
  @Input() public properties: EntityProperty[] = [];
  public codeSystemId?: string | null;
  public query = new EntityPropertySearchParams();
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
  }

  public deleteProperty(propertyId: number): void {
    this.codeSystemService.deleteEntityProperty(this.codeSystemId!, propertyId).subscribe(() => this.loadData());
  }

  public loadData(): void {
    const q = copyDeep(this.query);
    q.codeSystem = this.codeSystemId!;
    this.loading = true;
    this.codeSystemService.searchProperties(this.codeSystemId!, q).subscribe(ep => this.properties = ep.data).add(() => this.loading = false);
  }
}
