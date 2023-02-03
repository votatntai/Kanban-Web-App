import { IProject, IStatus, IIssue, IMember, ILabel, IPriority, IComment, ILink, ILogWork } from './kanban.type';
// -----------------------------------------------------------------------------------------------------
// @ Board
// -----------------------------------------------------------------------------------------------------
export class Project implements Required<IProject>
{
    id: string | null;
    name: string;
    leader: any;
    description: string | null;
    icon: string | null;
    lastActivity: string | null;
    statuses: Status[];
    labels: Label[];
    priorities: Priority[];
    members: Member[];
    isClose: boolean;

    /**
     * Constructor
     */
    constructor(board: IProject) {
        this.id = board.id || null;
        this.name = board.name;
        this.leader = board.leader;
        this.description = board.description || null;
        this.lastActivity = board.lastActivity || null;
        this.statuses = [];
        this.labels = [];
        this.priorities = [];
        this.members = [];
        this.isClose = board.isClose;

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

        // Priorities
        if (board.priorities) {
            this.priorities = board.priorities.map((priority) => {
                if (!(priority instanceof Priority)) {
                    return new Priority(priority);
                }

                return priority;
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
    isFirst: boolean;
    isLast: boolean;
    limit: number;
    issues: Issue[];

    /**
     * Constructor
     */
    constructor(list: IStatus) {
        this.id = list.id || null;
        this.projectId = list.projectId;
        this.position = list.position;
        this.isFirst = list.isFirst;
        this.isLast = list.isLast;
        this.limit = list.limit;
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
    isChild: boolean;
    labels: Label[];
    links: Link[];
    logWorks: LogWork[];
    comments: Comment[];
    dueDate: string | null;
    priorityId: string | null;
    assignee: IMember | null;
    reporter: IMember | null;
    estimateTime: number | null;
    type: any | null;
    isClose: boolean | null;
    childIssues: any[];
    createAt: string | null;
    updateAt: string | null;
    resolveAt: string | null;

    /**
     * Constructor
     */
    constructor(card: IIssue) {
        this.id = card.id || null;
        this.projectId = card.projectId;
        this.statusId = card.statusId;
        this.position = card.position;
        this.name = card.name;
        this.isChild = card.isChild;
        this.description = card.description || null;
        this.labels = [];
        this.links = [];
        this.logWorks = [];
        this.comments = [];
        this.dueDate = card.dueDate || null;
        this.priorityId = card.priorityId || null;
        this.assignee = card.assignee || null;
        this.childIssues = [];
        this.reporter = card.reporter || null;
        this.estimateTime = card.estimateTime || null;
        this.type = card.type || null;
        this.createAt = card.createAt || null;
        this.updateAt = card.updateAt || null;
        this.resolveAt = card.resolveAt || null;
        this.isClose = card.isClose || null;

        // Labels
        if (card.labels) {
            this.labels = card.labels.map((label) => {
                if (!(label instanceof Label)) {
                    return new Label(label);
                }

                return label;
            });
        }

        // Comments
        if (card.comments) {
            this.comments = card.comments.map((comment) => {
                if (!(comment instanceof Comment)) {
                    return new Comment(comment);
                }
                return comment;
            });
        }

        // Comments
        if (card.links) {
            this.links = card.links.map((link) => {
                if (!(link instanceof Link)) {
                    return new Link(link);
                }
                return link;
            });
        }

        // Logworks
        if (card.logWorks) {
            this.logWorks = card.logWorks.map((logWork) => {
                if (!(logWork instanceof LogWork)) {
                    return new LogWork(logWork);
                }
                return logWork;
            });
        }

        // Issues
        if (card.childIssues) {
            this.childIssues = card.childIssues;
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
    email: string;
    avatar: string | null;

    /**
     * Constructor
     */
    constructor(member: IMember) {
        this.id = member.id || null;
        this.name = member.name;
        this.email = member.email;
        this.avatar = member.avatar || null;
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Label
// -----------------------------------------------------------------------------------------------------
export class Label implements Required<ILabel>
{
    id: string | null;
    projectId: string;
    name: string;

    /**
     * Constructor
     */
    constructor(label: ILabel) {
        this.id = label.id || null;
        this.projectId = label.projectId;
        this.name = label.name;
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Label
// -----------------------------------------------------------------------------------------------------
export class Priority implements Required<IPriority>
{
    id: string | null;
    projectId: string;
    name: string;

    /**
     * Constructor
     */
    constructor(priority: IPriority) {
        this.id = priority.id || null;
        this.projectId = priority.projectId;
        this.name = priority.name;
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Comment
// -----------------------------------------------------------------------------------------------------
export class Comment implements Required<IComment>
{
    id: string | null;
    user: string;
    issueId: string;
    content: string;
    createAt: string;

    /**
     * Constructor
     */
    constructor(comment: IComment) {
        this.id = comment.id || null;
        this.user = comment.user;
        this.issueId = comment.issueId;
        this.content = comment.content;
        this.createAt = comment.createAt;
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Link
// -----------------------------------------------------------------------------------------------------
export class Link implements Required<ILink>
{
    id: string | null;
    issueId: string;
    url: string;
    description: string;

    /**
     * Constructor
     */
    constructor(link: ILink) {
        this.id = link.id || null;
        this.issueId = link.issueId;
        this.url = link.url;
        this.description = link.description;
    }
}

// -----------------------------------------------------------------------------------------------------
// @ Log work
// -----------------------------------------------------------------------------------------------------
export class LogWork implements Required<ILogWork>
{
    id: string | null;
    issueId: string;
    user: any;
    remainingTime: number;
    spentTime: number;
    description: string;
    createAt: string;

    /**
     * Constructor
     */
    constructor(logWork: ILogWork) {
        this.id = logWork.id || null;
        this.issueId = logWork.issueId;
        this.user = logWork.user;
        this.remainingTime = logWork.remainingTime;
        this.spentTime = logWork.spentTime;
        this.description = logWork.description;
        this.createAt = logWork.createAt;
    }
}
