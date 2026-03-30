import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MuiCardModule, MuiCheckboxModule, MuiTagModule, MuiButtonModule, MuiIconModule, MuiDividerModule} from '@termx-health/ui';
import {MarinaUtilModule} from '@termx-health/util';
import {TranslatePipe} from '@ngx-translate/core';
import {Server} from 'term-web/sys/_lib/space';
import {PrivilegedDirective} from 'term-web/core/auth/privileges/privileged.directive';

@Component({
  selector: 'tw-server-info-widget',
  templateUrl: './server-info-widget.component.html',
  imports: [MuiCardModule, MuiCheckboxModule, MuiTagModule, MuiButtonModule, MuiIconModule, MuiDividerModule,
    MarinaUtilModule, TranslatePipe, RouterLink, PrivilegedDirective]
})
export class ServerInfoWidgetComponent {
  @Input() server!: Server;
}
