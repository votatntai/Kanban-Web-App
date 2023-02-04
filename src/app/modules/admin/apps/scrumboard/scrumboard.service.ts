import { Comment, Issue, Label, Member, Project, Status, Link, LogWork } from './kanban.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Board, Card } from 'app/modules/admin/apps/scrumboard/scrumboard.models';

@Injectable({
    providedIn: 'root'
})
export class ScrumboardService {
    // Private
    private _board: BehaviorSubject<Board | null>;
    private _boards: BehaviorSubject<Board[] | null>;
    private _card: BehaviorSubject<Card | null>;

    private _project: BehaviorSubject<Project | null>;
    private _projects: BehaviorSubject<Project[] | null>;
    private _issue: BehaviorSubject<Issue | null>;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient
    ) {
        // Set the private defaults
        this._board = new BehaviorSubject(null);
        this._boards = new BehaviorSubject(null);
        this._card = new BehaviorSubject(null);

        this._project = new BehaviorSubject(null);
        this._projects = new BehaviorSubject(null);
        this._issue = new BehaviorSubject(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for board
     */
    get board$(): Observable<Board> {
        return this._board.asObservable();
    }

    get project$(): Observable<Project> {
        return this._project.asObservable();
    }
    /**
     * Getter for boards
     */
    get boards$(): Observable<Board[]> {
        return this._boards.asObservable();
    }

    get projects$(): Observable<Project[]> {
        return this._projects.asObservable();
    }

    /**
     * Getter for card
     */
    get card$(): Observable<Card> {
        return this._card.asObservable();
    }

    get issue$(): Observable<Issue> {
        return this._issue.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get boards
     */
    getBoards(): Observable<Board[]> {
        return this._httpClient.get<Board[]>('api/apps/scrumboard/boards').pipe(
            map(response => response.map(item => new Board(item))),
            tap(boards => this._boards.next(boards))
        );
    }

    getProjects(): Observable<Project[]> {
        return this._httpClient.get<Project[]>('/api/projects').pipe(
            map(response => response.map(item => new Project(item))),
            tap(projects => this._projects.next(projects))
        );
    }
    /**
     * Get board
     *
     * @param id
     */
    getBoard(id: string): Observable<Board> {
        return this._httpClient.get<Board>('api/apps/scrumboard/board', { params: { id } }).pipe(
            map(response => new Board(response)),
            tap(board => this._board.next(board))
        );
    }

    getProject(id: string): Observable<Project> {
        return this._httpClient.get<Project>('/api/projects/' + id).pipe(
            map(response => new Project(response)),
            tap(project => this._project.next(project))
        );
    }

    /**
     * Create board
     *
     * @param board
     */
    createBoard(board: Board): Observable<Board> {
        return this.boards$.pipe(
            take(1),
            switchMap(boards => this._httpClient.put<Board>('api/apps/scrumboard/board', { board }).pipe(
                map((newBoard) => {

                    // Update the boards with the new board
                    this._boards.next([...boards, newBoard]);

                    // Return new board from observable
                    return newBoard;
                })
            ))
        );
    }

    /**
 * Create project
 *
 * @param board
 */
    createProject(board: Project): Observable<Project> {
        return this.projects$.pipe(
            take(1),
            switchMap(boards => this._httpClient.post<Project>('/api/projects', board).pipe(
                map((newBoard) => {

                    // Update the boards with the new board
                    this._projects.next([newBoard, ...boards]);

                    // Return new board from observable
                    return newBoard;
                })
            ))
        );
    }

    /**
     * Update the board
     *
     * @param id
     * @param board
     */
    updateBoard(id: string, board: Board): Observable<Board> {
        return this.boards$.pipe(
            take(1),
            switchMap(boards => this._httpClient.patch<Board>('api/apps/scrumboard/board', {
                id,
                board
            }).pipe(
                map((updatedBoard) => {

                    // Find the index of the updated board
                    const index = boards.findIndex(item => item.id === id);

                    // Update the board
                    boards[index] = updatedBoard;

                    // Update the boards
                    this._boards.next(boards);

                    // Return the updated board
                    return updatedBoard;
                })
            ))
        );
    }

    /**
     * Delete the board
     *
     * @param id
     */
    deleteBoard(id: string): Observable<boolean> {
        return this.boards$.pipe(
            take(1),
            switchMap(boards => this._httpClient.delete('api/apps/scrumboard/board', { params: { id } }).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted board
                    const index = boards.findIndex(item => item.id === id);

                    // Delete the board
                    boards.splice(index, 1);

                    // Update the boards
                    this._boards.next(boards);

                    // Update the board
                    this._board.next(null);

                    // Update the card
                    this._card.next(null);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Create list
     *
     * @param list
     */
    createList(list: Status): Observable<Status> {
        return this._httpClient.post<Status>('/api/statuses', list).pipe(
            map(response => new Status(response)),
            tap((newList) => {

                // Get the project value
                const project = this._project.value;

                // Update the project lists with the new list
                project.statuses = [...project.statuses, newList];

                // Sort the project statuses
                project.statuses.sort((a, b) => a.position - b.position);

                // Update the project
                this._project.next(project);
            })
        );
    }

    /**
     * Update the list
     *
     * @param list
     */
    updateList(list: Status): Observable<Status> {
        return this._httpClient.put<Status>('/api/statuses/' + list.id, list).pipe(
            map(response => new Status(response)),
            tap((updatedList) => {

                // Get the project value
                const project = this._project.value;

                // Find the index of the updated list
                const index = project.statuses.findIndex(item => item.id === list.id);

                // Update the list
                project.statuses[index] = updatedList;

                // Sort the project lists
                project.statuses.sort((a, b) => a.position - b.position);

                // Update the project
                this._project.next(project);
            })
        );
    }

    /**
     * Update the lists
     *
     * @param lists
     */
    updateLists(lists: Status[]): Observable<Status[]> {
        return this._httpClient.put<Status[]>('/api/statuses', lists).pipe(
            map(response => response.map(item => new Status(item))),
            tap((updatedLists) => {

                // Get the project value
                const project = this._project.value;

                // Go through the updated lists
                updatedLists.forEach((updatedList) => {

                    // Find the index of the updated list
                    const index = project.statuses.findIndex(item => item.id === updatedList.id);

                    // Update the list
                    project.statuses[index] = updatedList;
                });

                // Sort the project lists
                project.statuses.sort((a, b) => a.position - b.position);

                // Update the project
                this._project.next(project);
            })
        );
    }

    getList(id: string): Observable<Status> {
        return this._httpClient.get('/api/statuses/' + id).pipe(
            tap((list: Status) => {
                const project = this._project.value;
                // Update project status with new status by status index
                project.statuses[project.statuses.indexOf(project.statuses.filter(status => status.id === list.id)[0])] = list;
                // Update the project
                this._project.next(project);
            })
        )
    }

    /**
     * Delete the list
     *
     * @param id
     */
    deleteList(id: string, inheritanceId: string): Observable<boolean> {
        return this._httpClient.delete<boolean>('/api/statuses/' + id, { params: { inheritanceId: inheritanceId } }).pipe(
            tap((isDeleted) => {

                // Get the project value
                const project = this._project.value;

                // Find the index of the deleted list
                const index = project.statuses.findIndex(item => item.id === id);

                // Delete the list
                project.statuses.splice(index, 1);

                this.getList(inheritanceId).subscribe();

                // Sort the project statuses
                project.statuses.sort((a, b) => a.position - b.position);

                // Update the project
                this._project.next(project);

            })
        );
    }

    /**
     * Get card
     */
    getCard(id: string): Observable<Issue> {
        return this._project.pipe(
            take(1),
            map((board) => {

                // Find the card
                const card = board.statuses.find(list => list.issues.some(item => item.id === id))
                    .issues.find(item => item.id === id);

                // Update the card
                this._issue.next(card);

                // Return the card
                return card;
            }),
            switchMap((card) => {

                if (!card) {
                    return throwError('Could not found the card with id of ' + id + '!');
                }

                return of(card);
            })
        );
    }

    /**
     * Create card
     *
     * @param card
     */
    createCard(card: Issue): Observable<Issue> {
        return this._httpClient.post<Issue>('/api/issues', card).pipe(
            map(response => new Issue(response)),
            tap((newCard) => {

                // Get the project value
                const project = this._project.value;

                // Find the list and push the new card in it
                project.statuses.forEach((listItem, index, list) => {
                    if (listItem.id === newCard.statusId) {
                        list[index].issues.push(newCard);
                    }
                });

                // Update the project
                this._project.next(project);

                // Return the new card
                return newCard;
            })
        );
    }

    /**
 * Create sub card
 *
 * @param card
 */
    createSubCard(card: Issue): Observable<Issue> {
        return this._httpClient.post<Issue>('/api/issues/child', card).pipe(
            map(response => new Issue(response)),
            tap((newCard) => {

                // Get the project value
                const project = this._project.value;

                // Find the list and push the new card in it
                project.statuses.forEach((listItem, index, list) => {
                    if (listItem.id === newCard.statusId) {
                        list[index].issues.push(newCard);
                    }
                });

                // Update the project
                this._project.next(project);

                // Return the new card
                return newCard;
            })
        );
    }

    /**
     * Update the card
     *
     * @param id
     * @param card
     */
    updateCard(id: string, card: Issue): Observable<Issue> {
        return this.project$.pipe(
            take(1),
            switchMap(board => this._httpClient.put<Issue>('/api/issues/' + id, card).pipe(
                map((updatedCard) => {

                    // Find the card and update it
                    board.statuses.forEach((listItem) => {
                        listItem.issues.forEach((cardItem, index, array) => {
                            if (cardItem.id === id) {
                                array[index] = updatedCard;
                            }
                        });
                    });

                    // Update the board
                    this._project.next(board);

                    // Update the card
                    this._issue.next(updatedCard);

                    // Return the updated card
                    return updatedCard;
                })
            ))
        );
    }

    /**
 * Update the card
 *
 * @param id
 * @param card
 */
    updateChildIssue(id: string, card: any): Observable<Issue> {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.put<any>('/api/issues/child/' + id, card).pipe(
                map((updatedCard) => {

                    board.childIssues.forEach((cardItem, index, array) => {
                        if (cardItem.id === id) {
                            array[index] = updatedCard;
                        }
                    })

                    // Update the board
                    this._issue.next(board);

                    // Return the updated card
                    return updatedCard;
                })
            ))
        );
    }

    /**
     * Update the cards
     *
     * @param cards
     */
    updateCards(cards: Issue[]): Observable<Issue[]> {
        return this._httpClient.put<Issue[]>('/api/issues', cards).pipe(
            map(response => response.map(item => new Issue(item))),
            tap((updatedCards) => {

                // Get the board value
                const project = this._project.value;

                // Go through the updated cards
                updatedCards.forEach((updatedCard) => {

                    // Find the index of the updated card's list
                    const listIndex = project.statuses.findIndex(list => list.id === updatedCard.statusId);

                    // Find the index of the updated card
                    const cardIndex = project.statuses[listIndex].issues.findIndex(item => item.id === updatedCard.id);

                    // Update the card
                    project.statuses[listIndex].issues[cardIndex] = updatedCard;

                    // Sort the issues
                    project.statuses[listIndex].issues.sort((a, b) => a.position - b.position);
                });

                // Update the project
                this._project.next(project);
            })
        );
    }

    /**
     * Delete the card
     *
     * @param id
     */
    deleteCard(id: string): Observable<boolean> {
        return this.project$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/issues/' + id).pipe(
                map((isDeleted: boolean) => {

                    // Find the card and delete it
                    board.statuses.forEach((listItem) => {
                        listItem.issues.forEach((cardItem, index, array) => {
                            if (cardItem.id === id) {
                                array.splice(index, 1);
                            }
                        });
                    });

                    // Update the board
                    this._project.next(board);

                    // Update the card
                    this._card.next(null);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    /**
     * Update card positions
     *
     * @param cards
     */
    updateCardPositions(cards: Card[]): void // Observable<Card[]>
    {
        /*return this._httpClient.patch<Card[]>('api/apps/scrumboard/board/card/positions', {cards}).pipe(
            map((response) => response.map((item) => new Card(item))),
            tap((updatedCards) => {

                // Get the board value
                const board = this._board.value;

                // Find the card and update it
                board.lists.forEach((listItem) => {
                    listItem.cards.forEach((cardItem, index, array) => {
                        if ( cardItem.id === id )
                        {
                            array[index] = updatedCard;
                        }
                    });
                });

                // Update the lists
                board.lists = updatedLists;

                // Sort the board lists
                board.lists.sort((a, b) => a.position - b.position);

                // Update the board
                this._board.next(board);
            })
        );*/
    }

    /**
     * Create label
     *
     * @param label
     */
    createLabel(label: Label): Observable<Label> {
        return this.project$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<Label>('/api/labels', label).pipe(
                map((newLabel) => {

                    // Update the board labels with the new label
                    board.labels = [...board.labels, newLabel];

                    // Update the board
                    this._project.next(board);

                    // Return new label from observable
                    return newLabel;
                })
            ))
        );
    }

    /**
     * Update the label
     *
     * @param id
     * @param label
     */
    updateLabel(id: string, label: Label): Observable<Label> {
        return this.project$.pipe(
            take(1),
            switchMap(board => this._httpClient.put<Label>('/api/labels/' + id, label).pipe(
                map((updatedLabel) => {

                    // Find the index of the updated label
                    const index = board.labels.findIndex(item => item.id === id);

                    // Update the label
                    board.labels[index] = updatedLabel;

                    // Update the label from any card that uses it
                    board.statuses.forEach((list) => {
                        list.issues.forEach((card) => {
                            const labelIndex = card.labels.findIndex(label => label.id === id);
                            if (labelIndex > -1) {
                                card.labels[labelIndex] = updatedLabel
                            }
                        });
                    });

                    // Update the board
                    this._project.next(board);

                    // Return the updated label
                    return updatedLabel;
                })
            ))
        );
    }

    /**
     * Delete the label
     *
     * @param id
     */
    deleteLabel(id: string): Observable<boolean> {
        return this.project$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/labels/' + id).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted label
                    const index = board.labels.findIndex(item => item.id === id);

                    // Delete the label
                    board.labels.splice(index, 1);

                    // If the label is deleted...
                    if (isDeleted) {
                        // Remove the label from any card that uses it
                        board.statuses.forEach((list) => {
                            list.issues.forEach((card) => {
                                const labelIndex = card.labels.findIndex(label => label.id === id);
                                if (labelIndex > -1) {
                                    card.labels.splice(labelIndex, 1);
                                }
                            });
                        });
                    }

                    // Update the board
                    this._project.next(board);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    // Post comment
    postComment(comment) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<Comment>('/api/comments', comment).pipe(
                map((newComment) => {

                    // Update the board labels with the new label
                    board.comments = [...board.comments, newComment];

                    // Update the board
                    this._issue.next(board);

                    // Return new label from observable
                    return newComment;
                })
            ))
        );
    }

    // Post comment
    postCommentForChild(comment) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<Comment>('/api/comments', comment).pipe(
                map((newComment) => {

                    board.childIssues.forEach((childIssue) => {
                        if (childIssue.id === comment.issueId) {
                            childIssue.comments = [...childIssue.comments, newComment];
                        }
                    });

                    // Update the board
                    this._issue.next(board);

                    // Return new label from observable
                    return newComment;
                })
            ))
        );
    }

    // Delete comment
    deleteComment(id: string) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/comments/' + id).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted label
                    const index = board.comments.findIndex(item => item.id === id);

                    // Delete the label
                    board.comments.splice(index, 1);

                    // Update the board
                    this._issue.next(board);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    // Delete comment
    deleteChildComment(id: string, childIssue: any) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/comments/' + id).pipe(
                map((isDeleted: boolean) => {

                    board.childIssues.forEach(child => {
                        if (child.id === childIssue.id) {
                            child.comments.forEach(comment => {
                                if (comment.id === id) {
                                    const index = child.comments.findIndex(item => item.id === id);
                                    child.comments.splice(index, 1);
                                }
                            });
                        }
                    })

                    // Update the board
                    this._issue.next(board);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    // Create web link
    createWebLink(data) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<Link>('/api/links', data).pipe(
                map((newWebLink) => {

                    // Update the board labels with the new label
                    board.links = [...board.links, newWebLink];

                    // Update the board
                    this._issue.next(board);

                    // Return new label from observable
                    return newWebLink;
                })
            ))
        );
    }

    // Create web link
    createLogWork(data) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<LogWork>('/api/log-works', data).pipe(
                map((newLogWork) => {

                    // Update the board labels with the new label
                    board.logWorks = [...board.logWorks, newLogWork];

                    // Update the board
                    this._issue.next(board);

                    // Return new label from observable
                    return newLogWork;
                })
            ))
        );
    }

    // Create child issue
    createChildIssue(data) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<any>('/api/issues/child', data).pipe(
                map((newChild) => {

                    // Update the board labels with the new label
                    board.childIssues = [...board.childIssues, newChild];

                    // Update the board
                    this._issue.next(board);

                    // Return new label from observable
                    return newChild;
                })
            ))
        );
    }

    // Delete web link
    deleteWebLink(id: string) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/links/' + id).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted label
                    const index = board.links.findIndex(item => item.id === id);

                    // Delete the label
                    board.links.splice(index, 1);

                    // If the label is deleted...
                    if (isDeleted) {
                        // Remove the label from any card that uses it
                        board.links.forEach((comment) => {
                            const labelIndex = board.links.findIndex(label => label.id === id);
                            if (labelIndex > -1) {
                                board.links.splice(labelIndex, 1);
                            }
                        });
                    }

                    // Update the board
                    this._issue.next(board);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    // Delete log work
    deleteLogWork(id: string) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/log-works/' + id).pipe(
                map((isDeleted: boolean) => {

                    // Find the index of the deleted label
                    const index = board.logWorks.findIndex(item => item.id === id);

                    // Delete the label
                    board.logWorks.splice(index, 1);

                    // If the label is deleted...
                    if (isDeleted) {
                        // Remove the label from any card that uses it
                        board.logWorks.forEach((comment) => {
                            const labelIndex = board.logWorks.findIndex(label => label.id === id);
                            if (labelIndex > -1) {
                                board.logWorks.splice(labelIndex, 1);
                            }
                        });
                    }

                    // Update the board
                    this._issue.next(board);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    updateProject(id, project) {
        return this.project$.pipe(
            take(1),
            switchMap(() => this._httpClient.put<Project>('/api/projects/' + id, project).pipe(
                map((updatedLabel) => {

                    // Update the board
                    this._project.next(updatedLabel);

                    // Return the updated label
                    return updatedLabel;
                })
            ))
        );
    }

    /**
     * Search within board cards
     *
     * @param query
     */
    search(query: string): Observable<Card[] | null> {
        // @TODO: Update the board cards based on the search results
        return this._httpClient.get<Card[] | null>('api/apps/scrumboard/board/search', { params: { query } });
    }

    // Search users
    searchUsers(search: string) {
        return this._httpClient.get<Member[]>('/api/users', { params: { search: search }, observe: 'response' })
    }

    // Invite member
    inviteMember(projectId: string, userId: string) {
        return this.project$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<Member>('/api/projects/member', null, {
                params: {
                    projectId: projectId,
                    memberId: userId
                }
            }).pipe(
                map((member) => {

                    board.members.push(member);

                    // Update the project
                    this._project.next(board);

                    // Return the member
                    return member;
                })
            ))
        );
    }

    // Delete comment
    removeMember(id: string, projectId: string) {
        return this.project$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/projects/member/',
                { params: { memberId: id, projectId: projectId } }).pipe(
                    map((isDeleted: boolean) => {

                        board.members.forEach((member, index, array) => {
                            if (member.id === id) {
                                array.splice(index, 1);
                            }
                        });

                        // Update the board
                        this._project.next(board);

                        // Return the deleted status
                        return isDeleted;
                    })
                ))
        );
    }

    /**
 * Delete the child issue card
 *
 * @param id
 */
    deleteChildIssue(id: string): Observable<boolean> {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.delete('/api/issues/' + id).pipe(
                map((isDeleted: boolean) => {

                    // Find the card and delete it
                    board.childIssues.forEach((cardItem, index, array) => {
                        if (cardItem.id === id) {
                            array.splice(index, 1);
                        }
                    });

                    // Update the card
                    this._issue.next(board);

                    // Return the deleted status
                    return isDeleted;
                })
            ))
        );
    }

    getFile(id: string) {
        return this._httpClient.get('/api/attachments/' + id, { responseType: 'arraybuffer' })
    }

    saveFile(issueId: string, data: FormData) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<any>('/api/attachments', data, { params: { issueId: issueId } }).pipe(
                map((newAttachment) => {

                    // Update the board labels with the new label
                    board.attachments = [...board.attachments, newAttachment];

                    // Update the board
                    this._issue.next(board);

                    // Return new label from observable
                    return newAttachment;
                })
            ))
        );
    }

    saveFileForChild(issueId: string, data: FormData) {
        return this.issue$.pipe(
            take(1),
            switchMap(board => this._httpClient.post<any>('/api/attachments', data, { params: { issueId: issueId } }).pipe(
                map((newAttachment) => {

                    board.childIssues.forEach(child => {
                        if (child.id === issueId) {
                            child.attachments = [...child.attachments, newAttachment]
                        }
                    })

                    // Update the board
                    this._issue.next(board);

                    // Return new label from observable
                    return newAttachment;
                })
            ))
        );
    }
}
