import {Injectable, OnDestroy} from '@angular/core';

export interface ShortcutAction {
  key: string;
  action: () => void;
  description?: string;
  context: string;
}

/**
 * Global keyboard-shortcut registry. Components register shortcuts per context and get an
 * unregister callback back. A help handler (see {@link ShortcutHelpComponent}) can render the
 * currently active shortcuts.
 *
 * Key format is `[Ctrl+][Alt+][Shift+]<KeyboardEvent.code>`, e.g. `Ctrl+KeyS`, `Shift+Slash`.
 */
@Injectable({providedIn: 'root'})
export class ShortcutService implements OnDestroy {
  private shortcuts = new Map<string, Map<string, ShortcutAction>>();
  private helpHandlers: (() => void)[] = [];

  private listener = (event: KeyboardEvent): void => {
    const key = this.buildKey(event);
    const match = Array.from(this.shortcuts.values())
      .flatMap(ctx => Array.from(ctx.values()))
      .reverse()
      .find(s => s.key === key);

    if (match) {
      event.preventDefault();
      match.action();
    }
  };

  public constructor() {
    window.addEventListener('keydown', this.listener);
  }

  public ngOnDestroy(): void {
    window.removeEventListener('keydown', this.listener);
  }

  // Help

  public registerHelpHandler(handler: () => void): void {
    this.helpHandlers.push(handler);
  }

  public triggerHelp(): void {
    this.helpHandlers.forEach(h => h());
  }

  public getActiveShortcuts(): ShortcutAction[] {
    const map = new Map<string, ShortcutAction>();
    Array.from(this.shortcuts.values())
      .flatMap(ctx => Array.from(ctx.values()))
      .reverse()
      .forEach(s => {
        if (!map.has(s.key)) {
          map.set(s.key, s);
        }
      });
    return Array.from(map.values());
  }

  // Registration

  public registerShortcut(context: string, key: string, action: () => void, description?: string): () => void {
    if (!this.shortcuts.has(context)) {
      this.shortcuts.set(context, new Map());
    }
    const ctx = this.shortcuts.get(context)!;
    ctx.set(key, {key, action, description, context});

    return () => {
      ctx.delete(key);
      if (ctx.size === 0) {
        this.shortcuts.delete(context);
      }
    };
  }

  public getShortcuts(context: string): ShortcutAction[] {
    return Array.from(this.shortcuts.get(context)?.values() || []);
  }

  private buildKey(event: KeyboardEvent): string {
    return [
      event.ctrlKey ? 'Ctrl' : '',
      event.altKey ? 'Alt' : '',
      event.shiftKey ? 'Shift' : '',
      event.code
    ].filter(Boolean).join('+');
  }
}
