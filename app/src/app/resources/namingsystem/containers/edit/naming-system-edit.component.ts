import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {NamingSystem, NamingSystemIdentifier} from 'terminology-lib/resources';
import {NamingSystemService} from '../../services/naming-system-service';
import {NamingSystemIdentifierFormComponent} from './naming-system-identifier-form.component';


@Component({
  templateUrl: './naming-system-edit.component.html',
})
export class NamingSystemEditComponent implements OnInit {
  public namingSystem?: NamingSystem;

  public loading: {[k: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;
  @ViewChild("identifiers") public identifiers?: NamingSystemIdentifierFormComponent;

  public constructor(
    private namingSystemService: NamingSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    const namingSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = namingSystemId ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadNamingSystem(namingSystemId!);
    } else {
      this.namingSystem = new NamingSystem();
      this.namingSystem.status = 'draft';
      this.namingSystem.identifiers = [new NamingSystemIdentifier()];
    }
  }

  private loadNamingSystem(id: string): void {
    this.loading['init'] = true;
    this.namingSystemService.load(id).subscribe(ns => this.namingSystem = ns).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (![validateForm(this.form), this.identifiers?.validate()].every(Boolean)) {
      return;
    }
    this.loading['save'] = true;
    this.namingSystemService.save(this.namingSystem!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k])
  }
}

