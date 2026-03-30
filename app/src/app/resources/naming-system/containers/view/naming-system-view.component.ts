import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NamingSystem} from 'term-web/resources/_lib';
import {NamingSystemService} from 'term-web/resources/naming-system/services/naming-system-service';
import { MuiFormModule, MuiCardModule, MuiMultiLanguageInputModule, MuiTableModule, MuiIconModule } from '@termx-health/ui';

import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    templateUrl: './naming-system-view.component.html',
    imports: [
    MuiFormModule,
    MuiCardModule,
    StatusTagComponent,
    MuiMultiLanguageInputModule,
    FormsModule,
    MuiTableModule,
    MuiIconModule,
    TranslatePipe
],
})
export class NamingSystemViewComponent implements OnInit {
  private namingSystemService = inject(NamingSystemService);
  private route = inject(ActivatedRoute);

  public namingSystem?: NamingSystem;
  public loading = false;

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
