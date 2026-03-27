import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MuiCardModule, MuiButtonModule, MuiIconModule, MuiListModule, MuiDividerModule, MuiDropdownModule, MuiPopconfirmModule, MuiNoDataModule} from '@kodality-web/marina-ui';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthoritativeResource} from 'term-web/sys/_lib/space';
import {StatusTagComponent} from 'term-web/core/ui/components/publication-status-tag/status-tag.component';

@Component({
  selector: 'tw-server-authoritative-list-widget',
  templateUrl: './server-authoritative-list-widget.component.html',
  imports: [MuiCardModule, MuiButtonModule, MuiIconModule, MuiListModule, MuiDividerModule,
    MuiDropdownModule, MuiPopconfirmModule, MuiNoDataModule, RouterLink, TranslatePipe, StatusTagComponent]
})
export class ServerAuthoritativeListWidgetComponent {
  @Input() serverId!: number;
  @Input() resources?: AuthoritativeResource[];
  @Input() resourceTypeLabel!: string;
  @Input() resourceType!: string;
  @Input() canEdit = false;
  @Output() resourceDeleted = new EventEmitter<AuthoritativeResource>();

  deleteResource(ar: AuthoritativeResource): void {
    this.resourceDeleted.emit(ar);
  }
}
