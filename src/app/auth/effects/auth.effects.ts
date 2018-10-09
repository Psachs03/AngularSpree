import { Injectable } from '@angular/core';
import { filter, switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';

import { User } from './../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { AuthActions } from '../actions/auth.actions';

@Injectable()
export class AuthenticationEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private authActions: AuthActions
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect()
  Authorized$: Observable<Action> = this.actions$
    .ofType(AuthActions.AUTHORIZE)
    .pipe(
      switchMap<Action, {status: string} & User>(() => this.authService.authorized()),
      filter(data => data.status !== 'unauthorized'),
      map(() => this.authActions.loginSuccess())
    );

  // tslint:disable-next-line:member-ordering
  @Effect()
  OAuthLogin: Observable<Action> = this.actions$
    .ofType(AuthActions.O_AUTH_LOGIN)
    .pipe(
      switchMap<Action & {payload: string}, string | User>(action => {
        return this.authService.socialLogin(action.payload);
      }),
      map(data => {
        if (typeof data === 'string') {
          return this.authActions.noOp();
        } else {
          return this.authActions.loginSuccess();
        }
      })
    );
}
