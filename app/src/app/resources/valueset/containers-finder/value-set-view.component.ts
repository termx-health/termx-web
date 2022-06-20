import {Component, OnInit} from '@angular/core';
import {ValueSet, ValueSetVersion} from 'lib/src/resources';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs';
import {MuiDestroyService} from '@kodality-health/marina-ui';
import {isNil} from '@kodality-web/core-util';
import {ValueSetService} from '../services/value-set.service';


@Component({
  templateUrl: 'value-set-view.component.html',
  providers: [MuiDestroyService]
})
export class FinderValueSetViewComponent implements OnInit {
  public valueSet?: ValueSet;
  public versions: ValueSetVersion[] = [];

  private loading: {[k: string]: boolean} = {};

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
    private destroy$: MuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (isNil(id)) {
        this.valueSet = undefined;
        return;
      }

      this.loading['general'] = true;
      this.valueSetService.load(id).subscribe(cs => {
        this.valueSet = cs;
      }).add(() => this.loading['general'] = false);
    });
  }

  public loadVersions(id: string): void {
    this.loading['versions'] = true;
    this.valueSetService.loadVersions(id)
      .subscribe(concepts => this.versions = concepts)
      .add(() => this.loading['versions'] = false);
  }


  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
