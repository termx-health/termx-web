import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {Ucum} from 'term-web/ucum/_lib';
import {UcumService} from '../../services/ucum.service';

@Component({
  templateUrl: './ucum-view.component.html',
})
export class UcumViewComponent implements OnInit {
  public ucum?: Ucum;

  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private ucumService: UcumService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    const ucumId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading['init'] = true;
    this.ucumService.load(ucumId).subscribe(mu => this.ucum = mu).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.ucumService.save(this.ucum!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
