import { Status } from './../../kanban.model';
import { user } from './../../../../../../mock-api/common/user/data';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject, takeUntil } from 'rxjs';
import { Project } from '../../kanban.model';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector: 'app-setting',
    templateUrl: 'setting.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SettingComponent implements OnInit {
    user: any;
    project: Project;
    projectForm: UntypedFormGroup;
    isOwner: boolean = false;
    canDone: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<SettingComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _scrumboardService: ScrumboardService,
        private _fuseConfirmationService: FuseConfirmationService,
        public matDialogRef: MatDialogRef<SettingComponent>,
    ) { }

    ngOnInit() {

        //Get user from local storage
        this.user = JSON.parse(localStorage.getItem('user'));

        // Get the project
        this._scrumboardService.project$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((board) => {

                // Board data
                this.project = board;

                // Check if user is project owner
                if (this.project.leader.id === this.user.id) {
                    this.isOwner = true;
                } else {
                    this.isOwner = false;
                }

                this.canDone = this.checkProjectCanMakeDone(this.project.statuses);

                // Check is project can make done
                // this.project.statuses.forEach(status => {
                //     status.issues.every(issue => {
                //         this.canDone = issue.isClose == true;
                //     })
                // })
            });

        // Init project form
        this.projectForm = this._formBuilder.group({
            name: [this.project.name, Validators.required],
            description: [this.project.description],
            leaderId: [this.project.leader.id]
        });
    }

    checkProjectCanMakeDone(statuses: Status[]) {
        var totalIssue = 0;
        var closedIssue = 0;
        statuses.forEach(status => {
            status.issues.forEach(issue => {
                totalIssue += 1;
                issue.childIssues.forEach(child => {
                    totalIssue += 1;
                })
            })
        })
        statuses.forEach(status => {
            status.issues.forEach(issue => {
                if (issue.isClose) {
                    closedIssue += 1;
                }
                issue.childIssues.forEach(child => {
                    if (child.isClose) {
                        closedIssue += 1;
                    }
                })
            })
        })
        if (totalIssue === closedIssue) {
            return true;
        }
        return false;
    }

    updateProject() {
        if (this.projectForm.valid) {
            this._scrumboardService.updateProject(this.project.id, this.projectForm.value).subscribe(() => {
                this.dialogRef.close();
            });

        }
    }

    leaderChanged(event) {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this.projectForm.controls['leaderId'].setValue(event.value);
            }
            this._changeDetectorRef.markForCheck();
        })
    }

    makeProjectDone() {
        this._fuseConfirmationService.open().afterClosed().subscribe(result => {
            if (result === 'confirmed') {
                this.project.isClose = true;
                this._scrumboardService.updateProject(this.project.id, this.project).subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                });
            }
        })
    }
}