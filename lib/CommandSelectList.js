'use babel';

import {$, SelectListView} from 'atom-space-pen-views';

export default class CommandSelectList extends SelectListView {
    constructor() {
        super(...arguments);

        this.commandBuild = [];
    }

    initialize() {
        super.initialize(...arguments);

        this.setItems(require('./commands'));
        this.panel = atom.workspace.addModalPanel({item: this});
        this.panel.show();
        this.focusFilterEditor();
    }

    viewForItem(item) {
        const filterKey = this.getFilterKey();
        const filterQuery = this.getFilterQuery().toLowerCase();
        const baseCommand = filterQuery.split(':');
        let view = '';

        if(baseCommand.length > 1 && Array.isArray(item.subCommands) && item.subCommands.length > 0) {
            view = [];

            if(baseCommand[1].length > 0) {
                this.filterWithFilterKey(item.subCommands, filterQuery.split(':')[1])
                    .forEach(c => view.push(c));
            } else
                item.subCommands.forEach(c => view.push(c));
        } else {
            let matches = (new RegExp(filterQuery, "ig")).exec(item.value);
            let itemText = item.value;

            if(matches !== null)
                matches.forEach(m => itemText = itemText.replace(m, `<b>${m}</b>`));

            view = `<li>${itemText}</li>`;
        }

        return view;
    }

    getFilterKey() {
        return ['command', 'value'];
    }

    filterWithFilterKey(items = null, query = null) {
        const filterKey = this.getFilterKey();
        const filterQuery = query || this.getFilterQuery().toLowerCase();

        if(items === null)
            items = this.items;

        if(filterQuery.length <= 0)
            return items;

        if(Array.isArray(filterKey)) {
            items = items.filter(c => {
                for(let i = 0; i < filterKey.length; i++) {
                    if(typeof c[filterKey[i]] !== 'undefined' && c[filterKey[i]].toLowerCase().startsWith(filterQuery))
                        return true;
                }

                return false;
            });
        } else
            items = items.filter(c => c[filterKey].toLowerCase().startsWith(filterQuery));

        return items;
    }

    populateList() {
        const filterKey = this.getFilterKey();
        const filterQuery = this.getFilterQuery().toLowerCase();
        let filteredItems = this.items;

        this.list.empty();

        if (filterQuery.length > 0) {
            const baseCommand = filterQuery.split(':');

            if(baseCommand.length > 1) {
                filteredItems = this.filterWithFilterKey(filteredItems, baseCommand[0])
                    .filter(c => {
                        if (Array.isArray(c.subCommands) && c.subCommands.length > 0) {
                            if(baseCommand[1].length <= 0) return true;

                            return (this.filterWithFilterKey(c.subCommands, baseCommand[1]).length > 0);
                        }

                        return (this.filterWithFilterKey([c], filterQuery).length > 0);
                    });
            } else
                filteredItems = this.filterWithFilterKey();
        }

        filteredItems.forEach(c => {
            let viewItem = this.viewForItem(c);

            if(Array.isArray(viewItem)) {
                viewItem.forEach(sc => {
                    const baseCommand = (filterQuery.indexOf(':') >= 0 ? filterQuery.split(':')[1] : filterQuery);
                    let matches = (new RegExp(baseCommand, "ig")).exec(sc.value);
                    let itemText = sc.parent.value + ' -> ' + sc.value;

                    if(matches !== null)
                        matches.forEach(m => itemText = itemText.replace(m, `<b>${m}</b>`));

                    let $item = $(`<li>${itemText}</li>`);
                    $item.data('select-list-item', sc);

                    this.list.append($item);
                });
            } else {
                let $item = $(viewItem);
                $item.data('select-list-item', c);

                this.list.append($item);
            }
        });

        this.selectItemView(this.list.find('li:first'));
    }

    confirmed(item) {
        if (item.isShorthand) {
            this.commandBuild.push(item.command);

            if (item.requiresInput) {
                this.cancel();
                this.inputPanel = item.showInputBox(this);
            } else {
                item.executeCommand(item.generateBaseCommand());
                this.cancel();
            }
        } else {
            this.commandBuild.push(item.command);
            this.setItems(item.subCommands);
            this.filterEditorView.setText('');
        }
    }

    cancelled() {
        // Destroy the CommandInputBox if it's open
        if (typeof this.inputPanel !== 'undefined') {
            this.inputPanel.hide();
            this.inputPanel.destroy();
        }

        this.panel.destroy();
        atom.workspace.getActivePane().activate();
    }
}
