export interface IProject {
    id?: string | null;
    name: string;
    description?: string | null;
    lastActivity?: string | null;
    statuses?: IStatus[];
    labels?: ILabel[];
    priorities?: IPriority[];
    members?: IMember[];
}

export interface IStatus {
    id?: string | null;
    projectId: string;
    position: number;
    isFirst: boolean;
    isLast: boolean;
    name: string;
    limit?: number;
    issues?: IIssue[];
}

export interface IIssue {
    id?: string | null;
    projectId: string;
    statusId: string;
    position: number;
    name: string;
    isChild: boolean;
    description?: string | null;
    labels?: ILabel[];
    dueDate?: string | null;
    priorityId?: string | null;
    assignee?: IMember | null;
    reporter?: IMember | null;
    childIssues?: IIssue[];
    estimateTime?: string | null;
    typeId?: string | null;
    createAt?: string | null;
    updateAt?: string | null;
    resolveAt?: string | null;
    isClose?: boolean | null;
}

export interface IMember {
    id?: string | null;
    name: string;
    email: string;
    avatar?: string | null;
}

export interface ILabel {
    id: string | null;
    projectId: string;
    name: string;
}

export interface IPriority {
    id: string | null;
    projectId: string;
    name: string;
}
