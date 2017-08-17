'use strict';

namespace popup {
    const triggers: Array<Trigger> = [
        {
            className: 'star',
            name: 'star',
        },
        {
            className: 'fork',
            name: 'fork',
        },
        {
            className: 'issue_open',
            name: 'new issue/PR',
        },
        {
            className: 'issue_com',
            name: 'issue/PR comment',
        },
        {
            className: 'issue_close',
            name: 'closed issue/PR',
        },
        {
            className: 'commit',
            name: 'commit',
        },
        {
            className: 'wiki',
            name: 'wiki edit',
        },
    ];

    document.getElementById('clear').addEventListener('click', () => {
        localStorage.clear();
        renderList();
    });

    const form: HTMLLabelElement = document.getElementById('add') as HTMLLabelElement;

    form.addEventListener('submit', (event): boolean | void => {
        event.preventDefault();
        const input: HTMLInputElement = document.getElementById('input') as HTMLInputElement;
        const repo: string = input.value;
        input.value = '';

        // If this repo is already in storage, stop.
        const repos = localStorage.getItem('repos') || {};
        if (repos.hasOwnProperty(repo)) {
            return false;
        }

        triggers.forEach((trigger): void => {
            localStorage.setItem(`${repo}/${trigger.className}`, 'true');
        });
        renderList();
    });

    renderList();

    function update(): void {
        chrome.runtime.sendMessage({update: true});
    }

    function newEl(repo: string): string {
        let outputHtml: string = `<li><span title="Delete" class="delete"></span><span class="repo"><span class="repoName">${repo}</span>
                    <span class="menu"><ul>`;

        triggers.forEach((trigger): void => {
            let state: string = 'checked="checked"';
            if (localStorage.getItem(`${repo}/${trigger.className}`) === 'false') {
                state = '';
            }
            outputHtml += `<li><input type="checkbox" ${state} class="${trigger.className} toggle"> ${trigger.name} notifications</li>`;
        });
        return outputHtml + '</ul></span></span></li>';
    }

    function toggleEvent(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const repo: string = (target.parentElement.parentElement.parentElement.parentElement.parentElement.getElementsByClassName('repoName')[0] as HTMLElement).innerText;
        const classes: DOMTokenList = target.classList;
        let type = "";

        if (classes.contains('star')) {
            type = 'star';
        } else if (classes.contains('fork')) {
            type = 'fork';
        } else if (classes.contains('issue_open')) {
            type = 'issue_open';
        } else if (classes.contains('issue_com')) {
            type = 'issue_com';
        } else if (classes.contains('issue_close')) {
            type = 'issue_close';
        } else if (classes.contains('commit')) {
            type = 'commit';
        } else if (classes.contains('wiki')) {
            type = 'wiki';
        }

        if (!target.checked) {
            localStorage.setItem(`${repo}/${type}`, 'false');
        } else {
            localStorage.setItem(`${repo}/${type}`, 'true');
        }
        update();
    }

    function deleteEvent(event: Event): void {
        event.preventDefault();
        const target: HTMLElement = event.target as HTMLElement;
        const repoSpan: HTMLSpanElement = target.parentElement.getElementsByClassName('repo')[0] as HTMLSpanElement;
        const repo: string = (repoSpan.getElementsByClassName('repoName')[0] as HTMLElement).innerText;
        const li: HTMLLIElement = repoSpan.parentElement as HTMLLIElement;
        triggers.forEach((trigger): void => {
            localStorage.removeItem(`${repo}/${trigger.className}`);
        });
        li.parentNode.removeChild(li);
        update();
    }

    function renderList(): void {
        const list: HTMLElement = document.getElementById('repos');
        const repos = [];
        const html = [];

        for (let i = 0; i < localStorage.length; i++) {
            const repo = localStorage.key(i).split('/').slice(0, 2).join('/');
            if (repos.indexOf(repo) === -1) {
                repos.push(repo);
                html.push(newEl(repo));
            }
        }
        list.innerHTML = html.join('');
        Array.prototype.map.call(document.querySelectorAll('.toggle'), (el: HTMLElement) => {
                el.removeEventListener('click', toggleEvent);
                el.addEventListener('click', toggleEvent);
            }
        );
        Array.prototype.map.call(document.querySelectorAll('.delete'), (el: HTMLElement) => {
                el.removeEventListener('click', deleteEvent);
                el.addEventListener('click', deleteEvent);
            }
        );
        update();
    }
}