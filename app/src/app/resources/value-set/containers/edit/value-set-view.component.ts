import {Component, OnInit} from '@angular/core';
import {ValueSet} from 'term-web/resources/_lib';
import {ValueSetService} from '../../services/value-set.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './value-set-view.component.html',
})
export class ValueSetViewComponent implements OnInit {
  public valueSetId?: string | null;
  public valueSet?: ValueSet;

  public loading = false;
  public narrativeRaw = false;

  public constructor(
    private valueSetService: ValueSetService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.valueSetId = this.route.snapshot.paramMap.get('id');
    this.loadValueSet(this.valueSetId!);
  }

  private loadValueSet(id: string): void {
    this.loading = true;
    this.valueSetService.load(id).subscribe(v => this.valueSet = v).add(() => this.loading = false);
  }
}
