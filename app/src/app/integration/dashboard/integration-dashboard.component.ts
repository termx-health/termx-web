import {Component} from '@angular/core';
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { MuiCardModule, MuiDividerModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { PrivilegedDirective } from 'term-web/core/auth/privileges/privileged.directive';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzCollapseComponent, NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';
import { TranslatePipe } from '@ngx-translate/core';

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
    ],
})
export class IntegrationDashboardComponent {
}
