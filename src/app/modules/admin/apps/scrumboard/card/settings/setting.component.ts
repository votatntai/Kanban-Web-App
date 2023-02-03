import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Project } from '../../kanban.model';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector: 'app-setting',
    templateUrl: 'setting.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SettingComponent implements OnInit {
    project: Project;
    projectForm: UntypedFormGroup;

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
        // Get project from dialog data
        this.project = this.data.project;

        // Init project form
        this.projectForm = this._formBuilder.group({
            name: [this.project.name, Validators.required],
            description: [this.project.description],
            leaderId: [this.project.leader.id]
        });
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
}