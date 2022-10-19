import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {ActivatedRoute, Router} from '@angular/router';
import {PageContent} from 'lib/src/thesaurus';
import {ThesaurusService} from '../../services/thesaurus.service';

@Component({
  templateUrl: 'thesaurus-page-edit.component.html'
})
export class ThesaurusPageEditComponent implements OnInit {
  public pageId?: number;
  public pageContent?: PageContent;
  public modalVisible?: boolean = false;
  public showPreview?: boolean = false;
  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private thesaurusService: ThesaurusService,
    private router: Router,
    private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe(routeParam => {
      const slug = routeParam.get('slug');
      if (slug) {
        this.loadContent(slug);
      }
    });
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.thesaurusService.savePageContent(this.pageContent!, this.pageId!).subscribe(() => this.closeEditMode()).add(() => this.loading['save'] = false);
  }

  public closeEditMode(): void {
    this.router.navigate(['/thesaurus/pages/', this.route.snapshot.paramMap.get('slug')]);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }

  private loadContent(slug: string): void {
    this.loading['init'] = true;
    this.thesaurusService.searchPageContents({slug: slug, limit: 1}).subscribe(contents => {
      const content = contents.data[0];
      if (!content) {
        this.router.navigate(['/thesaurus/pages']);
      } else {
        this.pageContent = content;
        this.pageId = content.pageId;
      }
    }).add(() => this.loading['init'] = false);
  }

  public openPageContentEdit(content: PageContent): void {
    this.modalVisible = false;
    this.pageContent = undefined;
    this.loading['update'] = true;
    setTimeout(() => {
      this.pageContent = content;
      this.loading['update'] = false;
    }, 200);
    this.router.navigate(['/thesaurus/pages/', content.slug, 'edit']);
  }
}
