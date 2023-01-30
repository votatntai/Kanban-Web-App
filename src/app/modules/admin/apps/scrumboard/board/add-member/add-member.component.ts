import { debounceTime } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Member } from '../../kanban.model';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector: 'app-add-member',
    templateUrl: 'add-member.component.html'
})

export class AddMemberComponent implements OnInit {

    searchUserForm: UntypedFormGroup;
    users: Member[] = [];
    projectMembers: Member[] = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AddMemberComponent>,
        private _formBuilder: UntypedFormBuilder,
        private _scrumboardService: ScrumboardService
    ) { }

    ngOnInit() {

        // Get project members from current project
        this.projectMembers = this.data.project.members;

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
        this._scrumboardService.inviteMember(this.data.project.id, userId).subscribe(() => {
            this.users = this.checkIfMemberAlreadyInProject(this.users);
        })
    }

    checkIfMemberAlreadyInProject(users: Member[]): Member[] {
        this.projectMembers.forEach(currentUser => {
            users = users.filter(user => user.id !== currentUser.id)
        })
        return users;
    }

}