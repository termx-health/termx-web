import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, inject } from '@angular/core';
import { SearchResult, ApplyPipe } from '@termx-health/core-util';
import { LocalizedName, MarinaUtilModule } from '@termx-health/util';
import {Subscription} from 'rxjs';
import {CodeSystem, CodeSystemLibService, CodeSystemSearchParams} from 'term-web/resources/_lib/code-system';
import { MuiSkeletonModule, MuiListModule, MuiDividerModule, MuiIconModule } from '@termx-health/ui';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-code-system-widget',
    templateUrl: 'code-system-widget.component.html',
    imports: [MuiSkeletonModule, MuiListModule, RouterLink, MuiDividerModule, NgTemplateOutlet, MuiIconModule, ApplyPipe, TranslatePipe, MarinaUtilModule]
})
export class CodeSystemWidgetComponent implements OnChanges {
  private codeSystemService = inject(CodeSystemLibService);

  @Input() public spaceId: number;
  @Input() public packageId: number;
  @Input() public packageVersionId: number;
  @Input() public text: string;

  @Input() public actionsTpl: TemplateRef<any>;
  @Output() public loaded = new EventEmitter<void>();

  private searchSub: Subscription;
  protected searchResult = SearchResult.empty<CodeSystem>();
  protected query = new CodeSystemSearchParams();
  protected loading = false;

  public constructor() {
    this.query.limit = 50;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['spaceId'] || changes['packageId'] || changes['packageVersionId'] || changes['text']) {
      this.search();
    }
  }

  private search(): void {
    this.searchSub?.unsubscribe();

    if (!this.spaceId && !this.packageId && !this.packageVersionId) {
      this.searchResult = SearchResult.empty();
      return;
    }

    this.loading = true;
    this.searchSub = this.codeSystemService.search({
      ...this.query,
      spaceId: this.spaceId,
      packageId: this.packageId,
      packageVersionId: this.packageVersionId,
      textContains: this.text
    }).subscribe(resp => {
      this.searchResult = resp;
      this.loading = false;
      this.loaded.emit();
    });
  }

  protected loadMore(): void {
    this.query.limit += 50;
    this.search();
  }

  protected firstName(ln: LocalizedName): string {
    return Object.values(ln).find(v => v.length);
  }
}
