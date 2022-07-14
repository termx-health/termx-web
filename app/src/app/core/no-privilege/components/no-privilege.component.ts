import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'twa-no-privilege',
  templateUrl: './no-privilege.component.html',
})
export class NoPrivilegeComponent implements OnInit {
  @Input() public privileges?: string[];
  public path?: string;

  public constructor(
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.path = this.router.url;
  }
}
