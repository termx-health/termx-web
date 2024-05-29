import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {TerminologyServerLibService, TerminologyServer} from 'term-web/sys/_lib/space';
import {Release} from 'term-web/sys/_lib';
import {ReleaseService} from '../../release/services/release.service';


@Component({
  templateUrl: 'release-edit.component.html'
})
export class ReleaseEditComponent implements OnInit {
  protected release?: Release;
  protected newAuthor?: string;
  protected terminologyServers?: TerminologyServer[];
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private releaseService: ReleaseService,
    private terminologyServerService: TerminologyServerLibService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.loadData();
    this.route.paramMap.subscribe(paramMap => {

      const id = paramMap.get('id');
      if (isDefined(id)) {
        this.mode = 'edit';
        this.loader.wrap('load', this.releaseService.load(Number(id))).subscribe(r => this.release = this.writeRelease(r));
      }
      this.release = this.writeRelease(new Release());
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

  public addAuthor(): void {
    this.release.authors = [...this.release.authors, this.newAuthor];
    this.newAuthor = undefined;
  }

  public deleteAuthor(author: string): void {
    const index = this.release.authors.indexOf(author);
    if (index !== -1) {
      this.release.authors.splice(index, 1);
    }
    this.newAuthor = undefined;
  }

  private writeRelease(r: Release): Release {
    r.authors ??= [];
    return r;
  }

  private loadData(): void {
    this.loader.wrap('data', this.terminologyServerService.search({limit: -1}))
      .subscribe(r => this.terminologyServers = r.data);
  }
}
