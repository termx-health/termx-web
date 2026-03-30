import {Component} from '@angular/core';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { MuiCardModule, MuiDividerModule, MuiButtonModule } from '@termx-health/ui';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzCollapseComponent, NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
import { TranslatePipe } from '@ngx-translate/core';
import { IntegrationUcumImportModalComponent } from 'term-web/integration/import/ucum/integration-ucum-import-modal.component';

@Component({
    templateUrl: './integration-dashboard.component.html',
    imports: [
        NzRowDirective,
        NzColDirective,
        MuiCardModule,
        PrivilegedDirective,
        MuiDividerModule,
        MuiButtonModule,
        RouterLink,
        NzCollapseComponent,
        NzCollapsePanelComponent,
        RouterOutlet,
        TranslatePipe,
        IntegrationUcumImportModalComponent,
    ],
})
export class IntegrationDashboardComponent {
}
