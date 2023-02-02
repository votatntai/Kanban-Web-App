import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '../../kanban.model';
import { ScrumboardService } from '../../scrumboard.service';

@Component({
    selector: 'app-setting',
    templateUrl: 'setting.component.html'
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
        this._scrumboardService.updateProject(this.project.id, this.projectForm.value).subscribe();
    }

    leaderChanged(event) {
        this.projectForm.controls['leaderId'].setValue(event.value);
    }
}