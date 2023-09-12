import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {LoadingManager, validateForm} from '@kodality-web/core-util';
import {DefinedProperty} from 'term-web/resources/_lib';
import {DefinedPropertyService} from '../services/defined-property.service';


@Component({
  templateUrl: './defined-property-edit.component.html',
})
export class DefinedPropertyEditComponent implements OnInit {
  protected entityProperty?: DefinedProperty;
  protected mode: 'add' | 'edit' = 'add';
  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private definedEntityPropertyService: DefinedPropertyService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.mode = id ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadEntityProperty(Number(id));
    } else {
      this.entityProperty = this.writeEntityProperty(new DefinedProperty());
    }
  }

  private loadEntityProperty(id: number): void {
    this.loader.wrap('load', this.definedEntityPropertyService.load(id)).subscribe(ep => this.entityProperty = this.writeEntityProperty(ep));
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loader.wrap('save', this.definedEntityPropertyService.save(this.entityProperty)).subscribe(() => this.location.back());
  }

  private writeEntityProperty(ep: DefinedProperty): DefinedProperty {
    ep.rule ??= {};
    return ep;
  }
}

