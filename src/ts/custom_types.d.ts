interface Trigger {
    className: string;
    name: string;
}

interface Repo {
    star: boolean;
    fork: boolean;
    issue_open: boolean;
    issue_com: boolean;
    issue_close: boolean;
    commit: boolean;
    wiki: boolean;
}