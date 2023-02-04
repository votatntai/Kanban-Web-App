export interface IProject {
    id?: string | null;
    name: string;
    leader?: any;
    description?: string | null;
    lastActivity?: string | null;
    statuses?: IStatus[];
    labels?: ILabel[];
    priorities?: IPriority[];
    members?: IMember[];
    isClose: boolean;
    createAt: string;
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
    comments?: IComment[];
    links?: ILink[];
    attachments?: IAttachment[];
    logWorks?: ILogWork[];
    dueDate?: string | null;
    priority?: IPriority | null;
    assignee?: IMember | null;
    reporter?: IMember | null;
    childIssues?: any[];
    estimateTime?: number | null;
    type?: any | null;
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

export interface IComment {
    id: string | null;
    user: any;
    issueId: string;
    content: string;
    createAt: string;
}

export interface ILink {
    id: string | null;
    issueId: string;
    url: string;
    description: string;
}

export interface ILogWork {
    id: string | null;
    issueId: string;
    user: any;
    spentTime: number;
    remainingTime: number;
    description: string;
    createAt: string;
}

export interface IAttachment {
    id: string | null;
    issueId: string;
    file: string;
    name: string;
    url: string;
}

