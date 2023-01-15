import { IProject, IStatus, IIssue, IMember, ILabel } from './kanban.type';
// -----------------------------------------------------------------------------------------------------
// @ Board
// -----------------------------------------------------------------------------------------------------
export class Project implements Required<IProject>
{
    id: string | null;
    name: string;
    description: string | null;
    icon: string | null;
    lastActivity: string | null;
    statuses: Status[];
    labels: Label[];
    members: Member[];

    /**
     * Constructor
     */
    constructor(board: IProject) {
        this.id = board.id || null;
        this.name = board.name;
        this.description = board.description || null;
        this.lastActivity = board.lastActivity || null;
        this.statuses = [];
        this.labels = [];
        this.members = [];

        // Lists
        if (board.statuses) {
            this.statuses = board.statuses.map((status) => {
                if (!(status instanceof Status)) {
                    return new Status(status);
                }

                return status;
            });
        }

        // Labels
        if (board.labels) {
            this.labels = board.labels.map((label) => {
                if (!(label instanceof Label)) {
                    return new Label(label);
                }

                return label;
            });
        }

        // Members
        if (board.members) {
            this.members = board.members.map((member) => {
                if (!(member instanceof Member)) {
                    return new Member(member);
                }

                return member;
            });
        }
    }
}

// -----------------------------------------------------------------------------------------------------
// @ List
// -----------------------------------------------------------------------------------------------------
export class Status implements Required<IStatus>
{
    id: string | null;
    projectId: string;
    position: number;
    name: string;
    issues: Issue[];

    /**
     * Constructor
     */
    constructor(list: IStatus) {
        this.id = list.id || null;
        this.projectId = list.projectId;
        this.position = list.position;
        this.name = list.name;
        this.issues = [];

        // Cards
        if (list.issues) {
            this.issues = list.issues.map((issue) => {
                if (!(issue instanceof Issue)) {
                    return new Issue(issue);
                }

                return issue;
            });
        }
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Card
// -----------------------------------------------------------------------------------------------------
export class Issue implements Required<IIssue>
{
    id: string | null;
    projectId: string;
    statusId: string;
    position: number;
    name: string;
    description: string | null;
    labels: Label[];
    dueDate: string | null;

    /**
     * Constructor
     */
    constructor(card: IIssue) {
        this.id = card.id || null;
        this.projectId = card.projectId;
        this.statusId = card.statusId;
        this.position = card.position;
        this.name = card.name;
        this.description = card.description || null;
        this.labels = [];
        this.dueDate = card.dueDate || null;

        // Labels
        if (card.labels) {
            this.labels = card.labels.map((label) => {
                if (!(label instanceof Label)) {
                    return new Label(label);
                }

                return label;
            });
        }
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Member
// -----------------------------------------------------------------------------------------------------
export class Member implements Required<IMember>
{
    id: string | null;
    name: string;
    avatar: string | null;

    /**
     * Constructor
     */
    constructor(member: IMember) {
        this.id = member.id || null;
        this.name = member.name;
        this.avatar = member.avatar || null;
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Label
// -----------------------------------------------------------------------------------------------------
export class Label implements Required<ILabel>
{
    id: string | null;
    boardId: string;
    name: string;

    /**
     * Constructor
     */
    constructor(label: ILabel) {
        this.id = label.id || null;
        this.boardId = label.boardId;
        this.name = label.name;
    }
}
