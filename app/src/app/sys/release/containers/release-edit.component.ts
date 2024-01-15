import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {Release} from 'term-web/sys/_lib';
import {ReleaseService} from '../../release/services/release.service';


@Component({
  templateUrl: 'release-edit.component.html'
})
export class ReleaseEditComponent implements OnInit {
  protected release?: Release;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private releaseService: ReleaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');

      if (isDefined(id)) {
        this.mode = 'edit';
        this.loader.wrap('load', this.releaseService.load(Number(id))).subscribe(r => this.release = r);
      }
      this.release = new Release();
    });
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loader.wrap('save', this.releaseService.save(this.release))
      .subscribe(r => this.router.navigate(['/releases', r.id, 'summary']));
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
