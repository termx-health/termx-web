import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {catchError, finalize, map, Observable, of, Subject, takeUntil} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {BooleanInput, DestroyService, group, isDefined} from '@kodality-web/core-util';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {Project} from '../model/project';
import {ProjectLibService} from '../services/project-lib-service';
import {ProjectSearchParams} from '../model/project-search-params';

@Component({
  selector: 'tw-project-search',
  templateUrl: './project-search.component.html',
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProjectSearchComponent), multi: true}, DestroyService]
})
export class ProjectSearchComponent implements OnInit {
  @Input() @BooleanInput() public valuePrimitive: string | boolean = false;

  public data: {[id: number]: Project} = {};
  public value?: number;
  public searchUpdate = new Subject<string>();
  private loading: {[key: string]: boolean} = {};

  public onChange = (x: any) => x;
  public onTouched = (x: any) => x;

  public constructor(
    private projectService: ProjectLibService,
    private destroy$: DestroyService
  ) {}

  public ngOnInit(): void {
    this.searchUpdate.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(text => this.searchProjects(text)),
    ).subscribe(data => this.data = data);
  }

  public onSearch(text: string): void {
    this.searchUpdate.next(text);
  }

  private searchProjects(text: string): Observable<{[id: number]: Project}> {
    if (!text || text.length === 1) {
      return of(this.data!);
    }

    const q = new ProjectSearchParams();
    q.textContains = text;
    q.limit = 10_000;

    this.loading['search'] = true;
    return this.projectService.search(q).pipe(
      takeUntil(this.destroy$),
      map(projects => group(projects.data, p => p.id)),
      catchError(() => of(this.data!)),
      finalize(() => this.loading['search'] = false)
    );
  }

  private loadProject(id?: number): void {
    if (isDefined(id)) {
      this.loading['load'] = true;
      this.projectService.load(id).pipe(takeUntil(this.destroy$)).subscribe(project => {
        this.data = {[project.id]: project};
      }).add(() => this.loading['load'] = false);
    }
  }

  public writeValue(obj: Project | number): void {
    this.value = typeof obj === 'object' ? obj?.id : obj;
    this.loadProject(this.value);
  }

  public fireOnChange(): void {
    if (this.valuePrimitive) {
      this.onChange(this.value);
    } else {
      this.onChange(this.data?.[this.value!]);
    }
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }
}
