import {Component, OnInit} from '@angular/core';
import {NamingSystem} from '@terminology/core';
import {NamingSystemService} from '../../services/naming-system-service';
import {ActivatedRoute} from '@angular/router';


@Component({
  templateUrl: './naming-system-view.component.html',
})
export class NamingSystemViewComponent implements OnInit {
  public namingSystem?: NamingSystem;
  public loading = false;

  public constructor(
    private namingSystemService: NamingSystemService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    const namingSystemId = this.route.snapshot.paramMap.get('id');
    if (namingSystemId) {
      this.loadNamingSystem(namingSystemId);
    }
  }

  private loadNamingSystem(id: string): void {
    this.loading = true;
    this.namingSystemService.load(id).subscribe(ns => this.namingSystem = ns).add(() => this.loading = false);
  }
}
