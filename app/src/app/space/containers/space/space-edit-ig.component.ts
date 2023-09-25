import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {LoadingManager, remove, validateForm} from '@kodality-web/core-util';
import {SpaceIntegrationIg} from '../../_lib';
import {PageTreeItem} from '../../../wiki/_lib/page/models/page-tree.item';
import {PageLibService} from '../../../wiki/_lib';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-space-edit-ig',
  templateUrl: './space-edit-ig.component.html',
  styles: [`
    .ig-menu-item {
      display: flex;
      gap: 4px;
      margin-bottom: 4px;
    }

    .ig-submenu-item {
      display: flex;
      gap: 4px;
      margin-left: 20px;
      margin-bottom: 4px;
    }
  `]
})
export class SpaceEditIgComponent implements OnInit {
  @Input() public spaceId: number;
  @Input() public ig: SpaceIntegrationIg;

  protected igEnabled: boolean;
  protected pages: {id: number, name: string, level: number}[];
  protected pagesMap: {[id: number]: {id: number, name: string, level: number}};
  protected loader = new LoadingManager();

  @ViewChild('form') public form?: NgForm;

  public constructor(
    private pageService: PageLibService
  ) {}


  public ngOnInit(): void {
    this.igEnabled = !!this.ig;
    this.ig = this.ig ?? {};
    this.ig.menu = this.ig.menu ?? [];
    if (!this.ig.menu.some(m => m.name === 'Home')) {
      this.ig.menu.push({name: 'Home'});
    }

    this.loader.wrap('load', this.pageService.loadTree(this.spaceId)).subscribe(r => {
      this.pages = this.flat(r);
      this.pagesMap = {};
      this.pages.forEach(i => this.pagesMap[i.id] = i);
    });
  }

  public validate(): boolean {
    return validateForm(this.form);
  }

  public readForm(): SpaceIntegrationIg {
    return this.igEnabled ? this.ig : null;
  }

  protected flat(data: PageTreeItem[], level: number = 0): {id: number, name: string, level: number}[] {
    return !data ? [] : data.flatMap(d => {
      return [
        ...Object.values(d.contents).map(c => ({id: c.id, name: c.name, level: level})),
        ...(d.children ? this.flat(d.children, level + 1) : [])
      ];
    });
  }

  public addMenuItem(): void {
    this.ig.menu = [...this.ig.menu, {}];
  }

  public addSubmenu(m: any): void {
    m.children = m.children ? [...m.children, {}] : [{}];
  }

  public removeMenu(m: any): void {
    this.ig.menu = remove(this.ig.menu, m);
  }

  public removeSubmenu(m: any, c: any): void {
    m.children = remove(m.children, c);
    if (m.children.length === 0) {
      m.children = null;
    }
  }
}
