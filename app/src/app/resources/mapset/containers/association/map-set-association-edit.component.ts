import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MapSetAssociation} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {MapSetService} from '../../services/map-set-service';
import {Location} from '@angular/common';
import {MapSetEntityVersion} from 'terminology-lib/resources/mapset/model/map-set-entity-version';

@Component({
  templateUrl: './map-set-association-edit.component.html',
})
export class MapSetAssociationEditComponent implements OnInit {
  public mapSetId?: string | null;
  public association?: MapSetAssociation;
  public sourceCodeSystem?: string;
  public targetCodeSystem?: string;

  public loading = false;
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form!: NgForm;
  @ViewChild("modalForm") public modalForm!: NgForm;

  public entityVersionModalData: {
    visible?: boolean,
    editIndex?: number,
    entityVersion?: MapSetEntityVersion
  } = {};

  public constructor(
    private mapSetService: MapSetService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.mapSetId = this.route.snapshot.paramMap.get('id');
    const associationId = this.route.snapshot.paramMap.get('associationId');
    this.mode = associationId ? 'edit' : 'add';
    if (this.mode === 'edit') {
      this.loadAssociation(Number(associationId));
    } else {
      this.association = new MapSetAssociation();
    }
  }

  public loadAssociation(associationId: number): void {
    this.loading = true;
    this.mapSetService.loadAssociation(this.mapSetId!, associationId).subscribe(a => {
      this.association = a;
      this.sourceCodeSystem = a.source?.codeSystem;
      this.targetCodeSystem = a.target?.codeSystem;
    }).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.mapSetService.saveAssociation(this.mapSetId!, this.association!).subscribe(() => this.location.back()).add(() => this.loading = false);
  }

  public openEntityVersionModal(index?: number): void {
    if (isDefined(index)) {
      this.entityVersionModalData.entityVersion = copyDeep(this.association!.versions![index]);
      this.entityVersionModalData.editIndex = index;
    } else {
      this.entityVersionModalData.entityVersion = new MapSetEntityVersion();
      this.entityVersionModalData.entityVersion.status = 'draft';
    }
    this.entityVersionModalData.visible = true;
  }

  public closeEntityVersionModal(): void {
    this.entityVersionModalData = {};
  }

  public saveEntityVersionModal(): void {
    if (!validateForm(this.modalForm)) {
      return;
    }
    if (isDefined(this.entityVersionModalData.editIndex)) {
      this.association!.versions![this.entityVersionModalData.editIndex] = this.entityVersionModalData.entityVersion!;
    } else {
      this.association!.versions = [...(this.association!.versions || []), this.entityVersionModalData.entityVersion!];
    }
    this.association!.versions! = [...this.association?.versions!];
    this.closeEntityVersionModal();
  }
}