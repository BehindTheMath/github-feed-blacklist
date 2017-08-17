"use strict";

namespace contentScript {
    const feedSize = 50;

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

    function feedCleaning() {
        const lines: Array<Element> = Array.from(document.querySelectorAll(".news > .alert"));
        lines.forEach((line: HTMLElement) => {
            const classes: DOMTokenList = line.classList;
            const repoLine: string = (line.querySelectorAll(".title > a")[1] as HTMLAnchorElement).text;
            let repoName: string = repoLine;
            const anchor: number = repoLine.indexOf("#");
            if (anchor !== -1) {
                repoName = repoLine.slice(0, anchor);
            }

            getFromSyncStorage("repos").then((dataFromSyncStorage: ISyncStorageData) => {
                const repo: IRepo = dataFromSyncStorage.repos[repoName];

                if (line.parentNode) {
                    // TODO: refactor the following
                    if (classes.contains("watch_started")) {
                        if (repo.star) {
                            line.classList.add("ghff-hide");
                        } else {
                            line.classList.remove("ghff-hide");
                        }
                    }
                    if (classes.contains("fork")) {
                        if (repo.fork) {
                            line.classList.add("ghff-hide");
                        } else {
                            line.classList.remove("ghff-hide");
                        }
                    }
                    if (classes.contains("issues_opened")) {
                        if (repo.issue_open) {
                            line.classList.add("ghff-hide");
                        } else {
                            line.classList.remove("ghff-hide");
                        }
                    }
                    if (classes.contains("issues_comment")) {
                        if (repo.issue_com) {
                            line.classList.add("ghff-hide");
                        } else {
                            line.classList.remove("ghff-hide");
                        }
                    }
                    if (classes.contains("issues_closed")) {
                        if (repo.issue_close) {
                            line.classList.add("ghff-hide");
                        } else {
                            line.classList.remove("ghff-hide");
                        }
                    }
                    if (classes.contains("gollum")) {
                        if (repo.wiki) {
                            line.classList.add("ghff-hide");
                        } else {
                            line.classList.remove("ghff-hide");
                        }
                    }
                    if (classes.contains("push")) {
                        if (repo.commit) {
                            line.classList.add("ghff-hide");
                        } else {
                            line.classList.remove("ghff-hide");
                        }
                    }
                }

            });
        });
        countUpdate();
    }

    const observer: MutationObserver = new MutationObserver(() => {
        feedCleaning();
        if (document.querySelectorAll(".news > .alert:not(.ghff-hide)").length < feedSize) {
            loadNextPage();
        }
    });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.update) {
            feedCleaning();
        }
    });

    observer.observe(document.querySelector(".news"), {childList: true});

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

    feedCleaning();
    loadNextPage();

    function getFromSyncStorage(items: string | Array<string> | object): Promise<ISyncStorageData> {
        return new Promise<ISyncStorageData>(resolve => {
            chrome.storage.sync.get(items, resolve);
        });
    }
}
