import {Component, inject} from '@angular/core';
import {MuiFormModule, MuiListModule} from '@kodality-web/marina-ui';
import {InfoService} from './info.service';
import {CommonModule} from '@angular/common';
import {environment} from 'environments/environment';
import {CorePipesModule} from '@kodality-web/core-util';

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
                  <div class="m-subtitle small">{{ version | async }}</div>
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
                  <h4 class="m-items-middle">
                      Modules
                  </h4>

                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
                      <ng-container *ngFor="let module of modules | async">
                          <div class="cardy m-rounded">
                              {{ module }}
                          </div>
                      </ng-container>
                  </div>
              </section>

              <section>
                  <h4 class="small">
                      Configured
                  </h4>

                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.5rem ">
                      <div class="cardy m-rounded" *ngIf="env.swaggerUrl">
                          <div class="small">Swagger</div>
                          <a class="m-text-secondary small" [href]="env.swaggerUrl">{{ env.swaggerUrl }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.chefUrl">
                          <div class="small">Chef</div>
                          <a class="m-text-secondary small" [href]="env.chefUrl">{{ env.chefUrl }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.fmlEditor">
                          <div class="small">FML</div>
                          <a class="m-text-secondary small" [href]="env.fmlEditor">{{ env.fmlEditor }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.plantUmlUrl">
                          <div class="small">PlantUML</div>
                          <a class="m-text-secondary small" [href]="env.plantUmlUrl">{{ env.plantUmlUrl }}</a>
                      </div>

                      <div class="cardy m-rounded" *ngIf="env.snowstormUrl">
                          <div class="small">Snowstorm</div>
                          <a class="m-text-secondary small" [href]="env.snowstormUrl">{{ env.snowstormUrl }}</a>
                      </div>
                  </div>
              </section>
          </div>
      </m-form-row>
  `,
  styles: [`
    .small {
      font-size: 0.9rem;
    }

    .cardy {
      background: var(--color-background-component);
      padding: 1rem
    }
  `]
})
export default class InfoComponent {
  protected service = inject(InfoService);
  protected env = environment;

  protected version = this.service.version();
  protected modules = this.service.modules();
}
