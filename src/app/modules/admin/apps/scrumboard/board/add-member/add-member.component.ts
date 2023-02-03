import { Project } from './../../kanban.model';
import { project } from './../../../../../../mock-api/dashboards/project/data';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Member } from '../../kanban.model';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector: 'app-add-member',
    templateUrl: 'add-member.component.html'
})

export class AddMemberComponent implements OnInit {

    user: any;
    searchUserForm: UntypedFormGroup;
    users: Member[] = [];
    project: Project;
    isOwner: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public dialogRef: MatDialogRef<AddMemberComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _scrumboardService: ScrumboardService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) { }

    ngOnInit() {

        //Get user from local storage 
        this.user = JSON.parse(localStorage.getItem('user'));

        // Get the project
        this._scrumboardService.project$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((project: Project) => {
                this.project = { ...project };

                // Check if user is project owner
                if (this.project.leader.id === this.user.id) {
                    this.isOwner = true;
                } else {
                    this.isOwner = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Initial search form
        this.searchUserForm = this._formBuilder.group({
            search: [null, Validators.required]
        });

        // Search if search value changed
        this.searchUserForm.valueChanges.pipe(debounceTime(1000)).subscribe(form => {
            this._scrumboardService.searchUsers(form.search).subscribe(result => {
                this.users = this.checkIfMemberAlreadyInProject(result.body);
            }, error => {
                if (error.status === 404) {
                    this.users = []
                }
            })
        })
    }

    inviteMember(userId: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.inviteMember(this.project.id, userId).subscribe(() => {
                    this.users = this.checkIfMemberAlreadyInProject(this.users);
                })
            }
        })
    }

    checkIfMemberAlreadyInProject(users: Member[]): Member[] {
        this.project.members.forEach(currentUser => {
            users = users.filter(user => user.id !== currentUser.id)
        })
        return users;
    }

    removeMember(id: string) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this._scrumboardService.removeMember(id, this.project.id).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                })
            }
        })
    }

}