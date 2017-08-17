interface IRepo {
    star: boolean;
    fork: boolean;
    issue_open: boolean;
    issue_com: boolean;
    issue_close: boolean;
    commit: boolean;
    wiki: boolean;
}

interface IRepos {
    [key: string]: IRepo;
}

interface ISyncStorageData {
    repos?: IRepos;
}
