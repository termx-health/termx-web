import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from '../../code-system/services/code-system.service';
import {TranslateService} from '@ngx-translate/core';
import {DevCodeSystemRelationsComponent} from './dev-code-system-relations.component';
import {CodeSystem} from 'term-web/resources/_lib';
import {CodeSystemPropertiesComponent} from 'term-web/resources/code-system/containers/edit/property/code-system-properties.component';


@Component({
  templateUrl: 'dev-code-system-concept-list.component.html'
})
export class DevCodeSystemConceptListComponent implements OnInit {
  public codeSystemId?: string | null;

  public codeSystem?: CodeSystem;

  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;
  @ViewChild("relationsComponent") public relationsComponent?: DevCodeSystemRelationsComponent;
  @ViewChild("propertiesComponent") public propertiesComponent?: CodeSystemPropertiesComponent;

  public constructor(
    private translateService: TranslateService,
    private codeSystemService: CodeSystemService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.loading ['init'] = true;
    this.codeSystemService.load(this.codeSystemId!, true).subscribe(cs => this.codeSystem = cs).add(() => this.loading ['init'] = false);
  }

  public openEdit(): void {
    if (!this.codeSystemId) {
      return;
    }
    this.router.navigate(['/resources/dev/code-systems/', this.codeSystemId, 'edit']);
  }
}
