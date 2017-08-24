"use strict";

namespace contentScript {
    const feedSize = 50;

    const observer: MutationObserver = new MutationObserver(() => {
        feedCleaning()
            .then(() => {
                if (document.querySelectorAll(".news > .alert:not(.ghff-hide)").length < feedSize) {
                    loadNextPage();
                }
            });
    });

    observer.observe(document.querySelector(".news"), {childList: true});

    chrome.runtime.onMessage.addListener((request) => {
        if (request.update) {
            feedCleaning();
        }
    });

    const hideCount: HTMLElement = document.createElement("label");
    hideCount.classList.add("filter-label");
    hideCount.id = "hideCount";
    hideCount.textContent = "0";
    const insertTarget: Element = document.querySelector(".news .alert");
    insertTarget.parentElement.insertBefore(hideCount, insertTarget);

    document.getElementById("hideCount").addEventListener("click", () => {
        const hiddenElt: Array<Element> = Array.from(document.getElementsByClassName("ghff-hide"));
        if (hiddenElt.length && hiddenElt[0].classList.contains("ghff-show")) {
            hiddenElt.forEach((elt: HTMLElement) => {
                elt.classList.remove("ghff-show");
            });
        } else {
            hiddenElt.forEach((elt: HTMLElement) => {
                elt.classList.add("ghff-show");
            });
        }
    });

    function loadNextPage() {
        const button: HTMLButtonElement = document.querySelector(".news > form > button") as HTMLButtonElement;
        if (button) {
            button.click();
            return true;
        }
        return false;
    }

    function countUpdate() {
        const count = document.getElementById("hideCount");
        count.textContent = document.getElementsByClassName("ghff-hide").length.toString();
    }

    async function feedCleaning() {
        const repos: IRepos = (await getFromSyncStorage("repos") as ISyncStorageData).repos;

        const lines: Array<Element> = Array.from(document.querySelectorAll(".news > .alert"));
        lines.forEach((line: HTMLElement) => {
            const classes: DOMTokenList = line.classList;
            const repoLine: string = (line.querySelectorAll(".title > a")[1] as HTMLAnchorElement).text;
            const anchor: number = repoLine.indexOf("#");
            const repoName: string = anchor === -1 ? repoLine : repoLine.slice(0, anchor);

            if (line.parentNode && repos && repos.hasOwnProperty(repoName)) {
                const repo: IRepo = repos[repoName];
                shouldBeHidden(classes, repo) ? line.classList.add("ghff-hide") : line.classList.remove("ghff-hide");
            }
        });

        countUpdate();
    }

    function shouldBeHidden(classes: DOMTokenList, repo: IRepo): boolean {
        return (classes.contains("watch_started") && repo.star) ||
            (classes.contains("fork") && repo.fork) ||
            (classes.contains("issues_opened") && repo.issue_open) ||
            (classes.contains("issues_comment") && repo.issue_com) ||
            (classes.contains("issues_closed") && repo.issue_close) ||
            (classes.contains("gollum") && repo.wiki) ||
            (classes.contains("push") && repo.commit);
    }

    function getFromSyncStorage(items: string | Array<string> | object): Promise<ISyncStorageData> {
        return new Promise<ISyncStorageData>(resolve => {
            chrome.storage.sync.get(items, resolve);
        });
    }
}
