import {Component, OnInit} from '@angular/core';
import {ValueSet, ValueSetLibService, ValueSetVersion} from 'app/src/app/resources/_lib';
import {LoadingManager} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {forkJoin} from 'rxjs';

@Component({
  templateUrl: 'value-set-version-provenances.component.html'
})
export class ValueSetVersionProvenancesComponent implements OnInit {
  protected valueSet?: ValueSet;
  protected valueSetVersion?: ValueSetVersion;
  protected loader = new LoadingManager();

  protected searchInput: string;

  public constructor(
    private route: ActivatedRoute,
    private valueSetService: ValueSetLibService
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadData(id, versionCode);
  }

  private loadData(valueSet: string, versionCode: string): void {
    this.loader.wrap('load',
      forkJoin([
        this.valueSetService.load(valueSet),
        this.valueSetService.loadVersion(valueSet, versionCode)
      ])).subscribe(([vs, vsv]) => {
      this.valueSet = vs;
      this.valueSetVersion = vsv;
    });
  }
}
