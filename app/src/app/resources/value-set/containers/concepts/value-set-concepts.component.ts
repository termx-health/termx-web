import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LoadingManager} from '@kodality-web/core-util';
import {ValueSet, ValueSetVersion} from 'term-web/resources/_lib';
import {ValueSetService} from 'term-web/resources/value-set/services/value-set.service';
import {forkJoin} from 'rxjs';
import { ResourceContextComponent } from 'term-web/resources/resource/components/resource-context.component';
import { MarinPageLayoutModule, MuiAlertModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: 'value-set-concepts.component.html',
    imports: [ResourceContextComponent, MarinPageLayoutModule, MuiAlertModule, TranslatePipe]
})
export class ValueSetConceptsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private valueSetService = inject(ValueSetService);

  protected valueSet?: ValueSet;
  protected versions?: ValueSetVersion[];
  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load',
      forkJoin([this.valueSetService.load(id), this.valueSetService.searchVersions(id, {decorated: true, limit: -1})]))
      .subscribe(([vs, versions]) => {
        this.valueSet = vs;
        this.versions = versions.data;
      });
  }
}
