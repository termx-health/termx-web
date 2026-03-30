import {Component, OnInit, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LoadingManager} from '@termx-health/core-util';
import {MuiSpinnerModule, MuiFormModule, MuiCardModule, MuiIconModule, MuiDividerModule} from '@termx-health/ui';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthoritativeResource, Server} from 'term-web/sys/_lib/space';
import {ServerService} from 'term-web/sys/space/services/server.service';
import {ResourceContextComponent} from 'term-web/resources/resource/components/resource-context.component';
import {ServerInfoWidgetComponent} from './widgets/server-info-widget.component';
import {ServerAuthoritativeListWidgetComponent} from './widgets/server-authoritative-list-widget.component';
import {AuthService} from 'term-web/core/auth';
import {copyDeep} from '@termx-health/core-util';

@Component({
  templateUrl: './server-summary.component.html',
  imports: [MuiSpinnerModule, MuiFormModule, MuiCardModule, MuiIconModule, MuiDividerModule, TranslatePipe,
    ResourceContextComponent, ServerInfoWidgetComponent,
    ServerAuthoritativeListWidgetComponent]
})
export class ServerSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private serverService = inject(ServerService);
  private authService = inject(AuthService);

  protected server?: Server;
  protected loader = new LoadingManager();
  protected canEdit = false;

  // Adapter to match ResourceContextComponent's Resource interface
  protected get resourceAdapter(): any {
    return this.server ? {id: this.server.id, title: this.server.names, name: this.server.code} : undefined;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.canEdit = this.authService.hasPrivilege(id + '.Space.edit');
    this.loader.wrap('load', this.serverService.load(Number(id)))
      .subscribe(ts => this.server = ts);
  }

  onServerChanged(server: Server): void {
    this.loader.wrap('save', this.serverService.save(server))
      .subscribe(ts => this.server = ts);
  }

  deleteAuthoritative(field: string, ar: AuthoritativeResource): void {
    this.server[field] = this.server[field].filter(r => r !== ar);
    this.onServerChanged(copyDeep(this.server));
  }
}
