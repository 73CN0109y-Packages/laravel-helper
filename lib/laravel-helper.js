'use babel';

import { CompositeDisposable } from 'atom';
import CommandSelectList from './CommandSelectList';

export default {
    config: {
        commandFilePath: {
            type: 'string',
            default: '',
        }
    },

    laravelHelperView: null,
    subscriptions: null,

    activate(state) {
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'laravel-helper:toggle': () => this.toggle()
        }));

        // Create dock
        /*const item = {
            element: document.createElement('div'),
            getTitle() { return 'Laravel Helper'; },
            getDefaultLocation() { return 'bottom'; }
        };

        // Create the dock without showing it
        atom.workspace.open(item, {
            activatePane: false,
            activateItem: false
        });*/
    },

    deactivate() {
        if (this.laravelHelperView !== null)
            this.laravelHelperView.cancel();

        this.subscriptions.dispose();
    },

    serialize() {
        return {
            laravelHelperViewState: (this.laravelHelperView !== null ?
                this.laravelHelperView.serialize() : null)
        };
    },

    toggle() {
        this.laravelHelperView = new CommandSelectList();
    }
};
