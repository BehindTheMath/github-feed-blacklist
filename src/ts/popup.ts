"use strict";

namespace popup {
    renderList(false);

    document.getElementById("clear").addEventListener("click", () => {
        chrome.storage.sync.remove("repos", renderList);
    });

    document.getElementById("add").addEventListener("submit", async (event) => {
        event.preventDefault();
        const input: HTMLInputElement = document.getElementById("input") as HTMLInputElement;
        const repoName: string = input.value;
        input.value = "";

        const repos: IRepos = (await getFromSyncStorage("repos")).repos;
        // If this repo is not yet in storage, continue.
        if (!repos.hasOwnProperty(repoName)) {
            repos[repoName] = {
                star: true,
                fork: true,
                issue_open: true,
                issue_com: true,
                issue_close: true,
                commit: true,
                wiki: true
            };
            chrome.storage.sync.set({repos: repos}, renderList);
        }
    });

    function update(): void {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {update: true});
        });
    }

    function newEl(repoName: string, repo: IRepo): string {
        let outputHtml: string = `<li><span title="Delete" class="delete"></span><span class="repo"><span class="repoName">${repoName}</span>
                    <span class="menu"><ul>`;

        outputHtml += `<li><input type="checkbox" ${repo.star ? "checked" : ""} class="toggle star">Star notifications</li>`;
        outputHtml += `<li><input type="checkbox" ${repo.fork ? "checked" : ""} class="toggle fork">Fork notifications</li>`;
        outputHtml += `<li><input type="checkbox" ${repo.issue_open ? "checked" : ""} class="toggle issue_open">New issue/PR notifications</li>`;
        outputHtml += `<li><input type="checkbox" ${repo.issue_com ? "checked" : ""} class="toggle issue_com">Issue/PR comment notifications</li>`;
        outputHtml += `<li><input type="checkbox" ${repo.issue_close ? "checked" : ""} class="toggle issue_close">Closed issue/PR notifications</li>`;
        outputHtml += `<li><input type="checkbox" ${repo.commit ? "checked" : ""} class="toggle commit">Commit notifications</li>`;
        outputHtml += `<li><input type="checkbox" ${repo.wiki ? "checked" : ""} class="toggle wiki">Wiki edit notifications</li>`;

        return outputHtml + `</ul></span></span></li>`;
    }

    async function toggleEvent(event: Event) {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const repoName: string = (target.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("repoName")[0] as HTMLElement).innerText;
        const classes: DOMTokenList = target.classList;
        const type: string = classes.item(1);

        const repos: IRepos = (await getFromSyncStorage("repos")).repos;
        repos[repoName][type] = target.checked;
        chrome.storage.sync.set({repos: repos});

        update();
    }

    async function deleteEvent(event: Event) {
        event.preventDefault();
        const target: HTMLElement = event.target as HTMLElement;
        const repoSpan: HTMLSpanElement = target.parentElement.getElementsByClassName("repo")[0] as HTMLSpanElement;
        const repoName: string = (repoSpan.getElementsByClassName("repoName")[0] as HTMLElement).innerText;
        const li: HTMLLIElement = repoSpan.parentElement as HTMLLIElement;
        li.parentNode.removeChild(li);

        const repos: IRepos = (await getFromSyncStorage("repos")).repos;
        delete repos[repoName];
        chrome.storage.sync.set({repos: repos});

        update();
    }

    async function renderList(updatePage: boolean = true) {
        const list: HTMLElement = document.getElementById("repos");
        //const repos = [];
        const html: Array<string> = [];

        const repos: IRepos = (await getFromSyncStorage("repos")).repos;
        Object.keys(repos).forEach((repoName: string) => {
            html.push(newEl(repoName, repos[repoName]));
        });

        list.innerHTML = html.join("");

        document.querySelectorAll(".toggle").forEach((element: HTMLElement) => {
            element.addEventListener("click", toggleEvent);
        });
        document.querySelectorAll(".delete").forEach((element: HTMLElement) => {
            element.addEventListener("click", deleteEvent);
        });

        if (updatePage) update();
    }

    function getFromSyncStorage(items: string | Array<string> | object): Promise<ISyncStorageData> {
        return new Promise<ISyncStorageData>(resolve => {
            chrome.storage.sync.get(items, resolve);
        });
    }
}
