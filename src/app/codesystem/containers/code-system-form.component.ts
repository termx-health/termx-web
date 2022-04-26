import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CodeSystem} from '../services/code-system';
import {CodeSystemService} from '../services/code-system.service';
import {Location} from '@angular/common';

@Component({
  templateUrl: 'code-system-form.component.html'
})
export class CodeSystemFormComponent implements OnInit {
  public codeSystem: CodeSystem;
  public loading: boolean;

  constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  public ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    if (params.has('id')) {
      this.loading = true;
      this.codeSystemService.load(params.get('id')).subscribe(cs => this.codeSystem = cs).add(() => this.loading = false);
    } else {
      this.codeSystem = new CodeSystem();
      this.codeSystem.names = {};
    }
  }

  public save(): void {
    this.codeSystemService.save(this.codeSystem).subscribe(() => this.location.back());
  }
}
