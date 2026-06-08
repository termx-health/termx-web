import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {CorePipesModule} from '@termx-health/core-util';
import {MuiFormModule, MuiListModule} from '@termx-health/ui';
import {environment} from 'environments/environment';
import {InfoService} from 'term-web/core/info/info.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MuiFormModule,
    MuiListModule,
    CorePipesModule
  ],
  template: `
      <m-form-row>
        <div *m-form-col class="tw-flex-container" style="gap: 2rem">
          <h1 style="margin-top: 2.5rem">
            <div>{{ env.appVersion }}</div>
            @if (webBuild | async; as wb) {
              <div class="m-subtitle small">
                @if (wb.buildTime) {<span>built {{ wb.buildTime }}</span>}
                @if (wb.pr) {<span> · PR #{{ wb.pr }}</span>}
                @if (wb.commit) {<span> · {{ wb.commit }}</span>}
              </div>
            }
            @if (serviceInfo | async; as si) {
              <div class="m-subtitle small">service: {{ si.version }}</div>
              @if (si.buildTime || si.pr || si.commit) {
                <div class="m-subtitle small">
                  @if (si.buildTime) {<span>built {{ si.buildTime }}</span>}
                  @if (si.pr) {<span> · PR #{{ si.pr }}</span>}
                  @if (si.commit) {<span> · {{ si.commit }}</span>}
                </div>
              }
            }
          </h1>
      
          <section>
            <h4 class="small">
              Web
            </h4>
      
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
              <div class="cardy m-rounded">
                <div class="small">Default language</div>
                <div class="m-text-secondary small">{{ env.defaultLanguage }}</div>
              </div>
      
              <div class="cardy m-rounded">
                <div class="small">UI languages</div>
                <div class="m-text-secondary small">{{ env.uiLanguages | join: ', ' }}</div>
              </div>
            </div>
          </section>
      
          <section>
            <h4 class="small">
              Modules
            </h4>
      
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
              @for (module of modules | async; track module) {
                <div class="cardy m-rounded">
                  {{ module }}
                </div>
              }
            </div>
          </section>
      
          <section>
            <h4 class="small">
              Configured
            </h4>
      
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
              @if (env.swaggerUrl) {
                <div class="cardy m-rounded">
                  <div class="small">Swagger</div>
                  <a class="m-text-secondary small" [href]="env.swaggerUrl">{{ env.swaggerUrl }}</a>
                </div>
              }
      
              @if (env.chefUrl) {
                <div class="cardy m-rounded">
                  <div class="small">Chef</div>
                  <a class="m-text-secondary small" [href]="env.chefUrl">{{ env.chefUrl }}</a>
                </div>
              }
      
              @if (env.fmlEditor) {
                <div class="cardy m-rounded">
                  <div class="small">FML</div>
                  <a class="m-text-secondary small" [href]="env.fmlEditor">{{ env.fmlEditor }}</a>
                </div>
              }
      
              @if (env.plantUmlUrl) {
                <div class="cardy m-rounded">
                  <div class="small">PlantUML</div>
                  <a class="m-text-secondary small" [href]="env.plantUmlUrl">{{ env.plantUmlUrl }}</a>
                </div>
              }
      
              @if (env.snowstormUrl) {
                <div class="cardy m-rounded">
                  <div class="small">Snowstorm</div>
                  <a class="m-text-secondary small" [href]="env.snowstormUrl">{{ env.snowstormUrl }}</a>
                </div>
              }
            </div>
          </section>
        </div>
      </m-form-row>
      `,
  styles: [`
    .small {
      font-size: 0.9rem;
      word-break: break-all;
    }

    .cardy {
      background: var(--color-background-component);
      padding:  0.8rem 1rem
    }
  `]
})
export default class InfoComponent {
  protected service = inject(InfoService);
  protected env = environment;

  protected modules = this.service.modules();
  protected webBuild = this.service.webBuild();
  protected serviceInfo = this.service.serviceInfo();
}
