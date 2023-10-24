import {CanDeactivateFn, UrlTree} from "@angular/router";
import {Observable} from "rxjs";

type canDeactivateType = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

export interface UnsavedChangesGuardComponent {
  canDeactivate: () => canDeactivateType;
}

export const unsavedChangesGuard: CanDeactivateFn<UnsavedChangesGuardComponent> = (component: UnsavedChangesGuardComponent) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
