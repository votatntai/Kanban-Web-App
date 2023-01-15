import { Status, Project } from './../../kanban.model';
import { ScrumboardService } from 'app/modules/admin/apps/scrumboard/scrumboard.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-remove-status-dialog',
    templateUrl: 'remove-status-dialog.component.html',
    styles: [
        `
            .fuse-confirmation-dialog-panel {
                @screen md {
                    @apply w-128;
                }

                .mat-dialog-container {
                    padding: 0 !important;
                }
            }
        `
    ],
    encapsulation: ViewEncapsulation.None
})

export class RemoveStatusDialogComponent implements OnInit {

    removeStatusForm: UntypedFormGroup;
    statuses: Status[] = [];
    selectedRemoveStatus: Status;
    selectedInheritanceStatus: Status;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<RemoveStatusDialogComponent>,
        private _formBuilder: UntypedFormBuilder,
    ) { }

    ngOnInit() {
        this.statuses = this.data.project.statuses.filter(status => status.id !== this.data.id);
        this.selectedRemoveStatus = this.data.project.statuses.filter(status => status.id === this.data.id)[0];
        this.selectedInheritanceStatus = this.statuses[0];
        this.removeStatusForm = this._formBuilder.group({
            removeStatus: [this.selectedRemoveStatus.name],
        });
    }
}