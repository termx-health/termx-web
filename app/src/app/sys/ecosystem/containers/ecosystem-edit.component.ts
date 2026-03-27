import {Component, OnInit, ViewChild, inject} from '@angular/core';
import {NgForm, FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {MuiSpinnerModule, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule, MuiCheckboxModule, MuiMultiLanguageInputModule, MuiSelectModule} from '@kodality-web/marina-ui';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from 'term-web/core/auth';
import {Ecosystem} from 'term-web/sys/_lib/ecosystem';
import {Server, ServerSearchParams} from 'term-web/sys/_lib/space';
import {ServerLibService} from 'term-web/sys/_lib/space';
import {EcosystemService} from 'term-web/sys/ecosystem/services/ecosystem.service';

@Component({
  templateUrl: './ecosystem-edit.component.html',
  imports: [MuiSpinnerModule, MuiCardModule, MuiButtonModule, MuiFormModule, MuiInputModule,
    MuiCheckboxModule, MuiMultiLanguageInputModule, MuiSelectModule, FormsModule, TranslatePipe]
})
export class EcosystemEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ecosystemService = inject(EcosystemService);
  private serverService = inject(ServerLibService);
  private authService = inject(AuthService);

  protected ecosystem?: Ecosystem;
  protected loader = new LoadingManager();
  protected mode: 'edit' | 'add' = 'add';
  protected canEdit = false;
  protected servers: Server[] = [];

  @ViewChild('form') form?: NgForm;

  public ngOnInit(): void {
    this.loadServers();

    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      if (isDefined(id)) {
        this.mode = 'edit';
        this.canEdit = this.authService.hasPrivilege(id + '.Space.edit');
        this.loader.wrap('load', this.ecosystemService.load(Number(id)))
          .subscribe(e => this.ecosystem = e);
      } else {
        this.canEdit = this.authService.hasPrivilege('*.Space.edit');
        this.ecosystem = new Ecosystem();
        this.ecosystem.active = true;
        this.ecosystem.formatVersion = '1';
        this.ecosystem.serverIds = [];
      }
    });
  }

  private loadServers(): void {
    const params = new ServerSearchParams();
    params.limit = -1;
    this.serverService.search(params).subscribe(resp => this.servers = resp.data);
  }

  public compareIds = (a: number, b: number): boolean => a === b;

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.ecosystemService.save(this.ecosystem!))
      .subscribe(() => this.router.navigate(['/ecosystems']));
  }
}
