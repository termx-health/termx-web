import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {environment} from 'environments/environment';
import {SkinConfig} from 'environments/environment.base';
import {catchError, firstValueFrom, of} from 'rxjs';
import {BUILTIN_SKINS, SkinDefinition} from './skin';

/** Fields an external/inline skin is allowed to set. Anything else is ignored. */
const ALLOWED_KEYS: (keyof SkinConfig)[] = [
  'id', 'primaryColor', 'headerColor', 'headerText', 'logo', 'landingLogos', 'cssVars', 'stylesheets'
];

/**
 * Resolves and applies the active skin (branding + design tokens).
 *
 * Resolve order: external skin file ({@link Environment.skinUrl} or a path-like
 * {@link Environment.skin}) → built-in skin by id → 'main'; then inline
 * {@link Environment.branding} overrides are merged on top. Applied once at bootstrap
 * via {@link init} (wired through an APP_INITIALIZER) so there is no unstyled flash.
 *
 * Orthogonal to the per-user light/dark theme (PreferencesService).
 */
@Injectable({providedIn: 'root'})
export class SkinService {
  private http = inject(HttpClient);
  private _skin: SkinDefinition = BUILTIN_SKINS['main'];

  public get skin(): SkinDefinition {
    return this._skin;
  }

  /** Resolve the active skin then apply it. Never throws — falls back to 'main'. */
  public async init(): Promise<void> {
    try {
      this._skin = await this.resolve();
    } catch {
      this._skin = {...BUILTIN_SKINS['main']};
    }
    this.applySkin();
  }

  public async resolve(): Promise<SkinDefinition> {
    let resolved: SkinDefinition = {...BUILTIN_SKINS['main']};

    const ref = environment.skinUrl || environment.skin;
    if (ref && this.isExternal(ref)) {
      const ext = await this.fetchExternal(ref);
      // External skins are CSS/branding only — drop any code hook.
      resolved = {...resolved, ...this.sanitize(ext), registerWebComponents: undefined};
    } else if (ref && BUILTIN_SKINS[ref]) {
      resolved = {...resolved, ...BUILTIN_SKINS[ref]};
    }

    if (environment.branding) {
      resolved = {...resolved, ...this.sanitize(environment.branding)};
    }
    return resolved;
  }

  /** Idempotent: sets data-skin, CSS vars, and injects skin stylesheets. */
  public applySkin(): void {
    const skin = this._skin;
    const root = document.documentElement;
    root.setAttribute('data-skin', skin.id || 'main');

    if (skin.primaryColor) {
      root.style.setProperty('--color-primary', skin.primaryColor);
      root.style.setProperty('--primary-color', skin.primaryColor);
    }
    if (skin.headerColor) {
      root.style.setProperty('--skin-header-color', skin.headerColor);
    }
    if (skin.cssVars) {
      Object.entries(skin.cssVars).forEach(([k, v]) => root.style.setProperty(k, v));
    }
    (skin.stylesheets || []).forEach(href => this.injectStylesheet(href));

    if (skin.registerWebComponents) {
      skin.registerWebComponents().catch(() => {/* best effort */});
    }
  }

  private isExternal(ref: string): boolean {
    return ref.startsWith('http') || ref.startsWith('/') || ref.endsWith('.json');
  }

  private fetchExternal(url: string): Promise<SkinConfig> {
    return firstValueFrom(this.http.get<SkinConfig>(url).pipe(catchError(() => of({} as SkinConfig))));
  }

  private sanitize(cfg: SkinConfig): SkinConfig {
    const out: SkinConfig = {};
    for (const k of ALLOWED_KEYS) {
      if (cfg?.[k] !== undefined) {
        (out as Record<string, unknown>)[k] = cfg[k];
      }
    }
    return out;
  }

  private injectStylesheet(href: string): void {
    if (document.head.querySelector(`link[data-skin-style="${href}"]`)) {
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-skin-style', href);
    document.head.appendChild(link);
  }
}
