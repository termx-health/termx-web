import {Component, OnInit, inject} from '@angular/core';
import {MuiModalModule, MuiCoreModule, MuiNoDataModule} from '@termx-health/ui';
import {TranslatePipe} from '@ngx-translate/core';
import {ShortcutAction, ShortcutService} from 'term-web/core/shortcuts/shortcut.service';

/**
 * Renders the active keyboard shortcuts in a modal. Opened via {@link ShortcutService.triggerHelp}
 * (bound to a global shortcut in AppComponent). MuiModal replaces the fork's gov-dialog.
 */
@Component({
  selector: 'tw-shortcut-help',
  templateUrl: './shortcut-help.component.html',
  styles: [`
    .tw-shortcut-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.25rem 0;
    }
    .tw-shortcut-key {
      min-width: 7rem;
      font-family: monospace;
      font-size: 0.85rem;
      padding: 0.1rem 0.4rem;
      border: 1px solid var(--color-borders);
      border-radius: var(--border-radius-component, 4px);
      background: var(--color-background-light);
    }
  `],
  imports: [MuiModalModule, MuiCoreModule, MuiNoDataModule, TranslatePipe]
})
export class ShortcutHelpComponent implements OnInit {
  private shortcutService = inject(ShortcutService);

  protected visible = false;
  protected shortcuts: ShortcutAction[] = [];

  public ngOnInit(): void {
    this.shortcutService.registerHelpHandler(() => {
      this.shortcuts = this.shortcutService.getActiveShortcuts();
      this.visible = true;
    });
  }

  protected close(): void {
    this.visible = false;
  }

  protected formatKey(key: string): string {
    return key.replace(/Key/g, '').replace(/Digit/g, '');
  }
}
