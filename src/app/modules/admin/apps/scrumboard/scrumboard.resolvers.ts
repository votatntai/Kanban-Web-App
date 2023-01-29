import { Project, Issue } from './kanban.model';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';

@Injectable({
    providedIn: 'root'
})

export class KanbanBoardsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _scrumboardService: ScrumboardService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project[]> {
        return this._scrumboardService.getProjects();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ScrumboardBoardResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _scrumboardService: ScrumboardService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Project> {
        return this._scrumboardService.getProject(route.paramMap.get('boardId'))
            .pipe(
                // Error here means the requested task is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})
export class ScrumboardCardResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _scrumboardService: ScrumboardService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Issue> {
        return this._scrumboardService.getCard(route.paramMap.get('cardId'))
            .pipe(
                // Error here means the requested task is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}
