"use strict";

const feedSize = 50;

const loadNextPage = () => {
    const button: HTMLButtonElement = document.querySelector(".news > form > button") as HTMLButtonElement;
    if (button) {
        button.click();
        return true;
    }
    return false;
};

const countUpdate = () => {
    const count = document.getElementById("hideCount");
    count.textContent = document.getElementsByClassName("ghff-hide").length.toString();
};

const feedCleaning = () => {
    const lines: NodeListOf<Element> = document.querySelectorAll(".news > .alert");
    Array.prototype.forEach.call(lines, (line: HTMLElement) => {
        const classes: DOMTokenList = line.classList;
        const repoLine: string = (line.querySelectorAll(".title > a")[1] as HTMLAnchorElement).text;
        let repo: string = repoLine;
        const anchor: number = repoLine.indexOf("#");
        if (anchor !== -1) {
            repo = repoLine.slice(0, anchor);
        }

        chrome.runtime.sendMessage({repo}, (response) => {
            if (line.parentNode) {
                // TODO: refactor the following
                if (classes.contains("watch_started")) {
                    if (response.star === "true") {
                        line.classList.add("ghff-hide");
                    } else {
                        line.classList.remove("ghff-hide");
                    }
                }
                if (classes.contains("fork")) {
                    if (response.fork === "true") {
                        line.classList.add("ghff-hide");
                    } else {
                        line.classList.remove("ghff-hide");
                    }
                }
                if (classes.contains("issues_opened")) {
                    if (response.issue_open === "true") {
                        line.classList.add("ghff-hide");
                    } else {
                        line.classList.remove("ghff-hide");
                    }
                }
                if (classes.contains("issues_comment")) {
                    if (response.issue_com === "true") {
                        line.classList.add("ghff-hide");
                    } else {
                        line.classList.remove("ghff-hide");
                    }
                }
                if (classes.contains("issues_closed")) {
                    if (response.issue_close === "true") {
                        line.classList.add("ghff-hide");
                    } else {
                        line.classList.remove("ghff-hide");
                    }
                }
                if (classes.contains("gollum")) {
                    if (response.wiki === "true") {
                        line.classList.add("ghff-hide");
                    } else {
                        line.classList.remove("ghff-hide");
                    }
                }
                if (classes.contains("push")) {
                    if (response.commit === "true") {
                        line.classList.add("ghff-hide");
                    } else {
                        line.classList.remove("ghff-hide");
                    }
                }
            }
        });
    });
    countUpdate();
};

const observer = new MutationObserver(() => {
    feedCleaning();
    if (document.querySelectorAll(".news > .alert:not(.ghff-hide)").length < feedSize) {
        loadNextPage();
    }
});

chrome.runtime.onMessage.addListener(
    (request) => {
        if (request.update) {
            feedCleaning();
        }
    }
);

observer.observe(document.querySelector(".news"), {childList: true});

const hideCount = document.createElement("label");
hideCount.classList.add("filter-label");
hideCount.id = "hideCount";
hideCount.textContent = "0";
const insertTarget = document.querySelector(".news .alert");
insertTarget.parentElement.insertBefore(hideCount, insertTarget);

document.getElementById("hideCount").addEventListener("click", () => {
    const hiddenElt = document.getElementsByClassName("ghff-hide");
    if (hiddenElt.length && hiddenElt[0].classList.contains("ghff-show")) {
        Array.prototype.forEach.call(hiddenElt, (elt: HTMLElement) => {
            elt.classList.remove("ghff-show");
        });
    } else {
        Array.prototype.forEach.call(hiddenElt, (elt: HTMLElement) => {
            elt.classList.add("ghff-show");
        });
    }
});

feedCleaning();
loadNextPage();
