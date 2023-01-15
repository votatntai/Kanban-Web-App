export interface IProject {
    id?: string | null;
    name: string;
    description?: string | null;
    lastActivity?: string | null;
    statuses?: IStatus[];
    labels?: ILabel[];
    members?: IMember[];
}

export interface IStatus {
    id?: string | null;
    projectId: string;
    position: number;
    name: string;
    issues?: IIssue[];
}

export interface IIssue {
    id?: string | null;
    projectId: string;
    statusId: string;
    position: number;
    name: string;
    description?: string | null;
    labels?: ILabel[];
    dueDate?: string | null;
}

export interface IMember {
    id?: string | null;
    name: string;
    avatar?: string | null;
}

export interface ILabel {
    id: string | null;
    boardId: string;
    name: string;
}
