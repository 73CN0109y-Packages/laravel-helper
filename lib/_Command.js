'use babel';

import _ from 'lodash';
import CommandInputBox from './CommandInputBox';
import CommandOutputView from './CommandOutputView';
import os from 'os';
const exec = require('child_process').exec;

export default class Command {
	constructor(value, command = null, subCommands = null, argFormat = null, rootCommand = null) {
		this._parent = null;
		this.options = {
			value: null,
			command: null,
			subCommands: null,
			argFormat: null,
			rootCommand: null
		};

		if (typeof value === 'object') {
			this.options = _.merge(this.options, value);
			if (_.isEmpty(this.command)) this.command = this.value.toLowerCase();
			if (!this.isShorthand) this.subCommands = this.subCommands;
			return;
		}

		this.value = value;
		this.command = (_.isEmpty(command) ? this.value.toLowerCase() : command);
		this.subCommands = subCommands;
		this.argFormat = argFormat;
		this.rootCommand = rootCommand;
	}

	get isShorthand() {
		return !Array.isArray(this.subCommands);
	}

	get requiresInput() {
		return Array.isArray(this.params);
	}

	static stripOptionalChar(e) {
		return (e.endsWith('?') && !e.endsWith('\\?') ? e.substr(0, e.length - 1) : e);
	}

	get params() {
		return this.options.params;
	}

	set params(value) {
		this.options.params = value;
	}

	get rootCommand() {
		return this.options.rootCommand;
	}

	set rootCommand(value) {
		this.options.rootCommand = value;
	}

	get argFormat() {
		return this.options.argFormat;
	}

	set argFormat(value) {
		this.options.argFormat = value;
	}

	get command() {
		return this.options.command;
	}

	set command(value) {
		this.options.command = value;
	}

	get value() {
		return this.options.value;
	}

	set value(value) {
		this.options.value = value;
	}

	get subCommands() {
		return this.options.subCommands;
	}

	set subCommands(value) {
		this.options.subCommands = value;

		if (Array.isArray(this.subCommands)) {
			this.subCommands.filter(e => e.parent !== this)
				.forEach(e => e.parent = this);
		}
	}

	get parent() {
		return this._parent;
	}

	set parent(value) {
		this._parent = value;
	}

	showInputBox(parent) {
		this.domParent = parent;
		let options = this.options;
		options.parentValue = this.parent.value;
		const inputBox = new CommandInputBox(options);

		this.inputPanel = atom.workspace.addModalPanel({
			item: inputBox.element
		});
		this.inputPanel.show();

		inputBox.element.addEventListener('close', (e) => {
			const data = e.detail;

			if(data.didConfirm)
				this.processCommand(data.args);

			this.inputPanel.destroy();
			this.domParent.cancel();
		});

		inputBox.refs[Object.keys(inputBox.refs)[0]].element.focus();

		return this.inputPanel;
	}

	processCommand(args) {
		let command = this.argFormat;
		let commandVars = command.match(/\$\w+/ig);

		if(commandVars) {
			const missingArgs = [];

			// Remove arguments from the command if they are optional
			Object.keys(args).forEach(arg => {
				if(!args[arg].key.endsWith('?') || args[arg].key.endsWith('\\?'))
					return;

				if(_.isEmpty(args[arg].value)) {
					let matches = (new RegExp('--.*=\\$' + arg, 'g')).exec(command);

					if(matches) matches.forEach(match => command = command.replace(match, ''));
					else {
						matches = (new RegExp('\\$' + arg, 'g')).exec(command);
						matches.forEach(match => command = command.replace(match, ''));
					}
				}
			});

			this.params.forEach(p => {
				if(typeof p === 'string') {
					if(p.endsWith('?') && !p.endsWith('\\?')) return;
				} else {
					if(p.value.endsWith('?') && !p.value.endsWith('\\?')) return;
				}

				const paramName = (Command.stripOptionalChar(typeof p === 'string' ? p : p.value))
					.toLowerCase().replace(/\s(\w)/g, (match, p1) => {
						return p1.toUpperCase();
					});

				if(Object.keys(args).indexOf(paramName) < 0) {
					missingArgs.push(paramName);
				} else if(typeof args[paramName].value === 'undefined') {
					missingArgs.push(paramName);
				} else if(typeof args[paramName].value === 'string' && args[paramName].value.length <= 0)
					missingArgs.push(paramName);
			});

			if(missingArgs.length > 0)
				return atom.notifications.addError('Missing Fields!', {
					description: `You are missing the following fields:\r\n${missingArgs.join('\r\n')}`,
					dismissable: true
				});
		}

		Object.keys(args).forEach(a => {
			let matches = (new RegExp('\\$' + a + '', 'g')).exec(command);

			if(matches)
				matches.forEach(match => command = command.replace(match, args[a].value));
		});

		command = command.replace(/--(\w+)=(\w+)\b/ig, (match, p1, p2) => {
			return `--${p1.toLowerCase()}=${p2}`;
		});

		this.executeCommand(this.generateBaseCommand() + ' ' + command);
	}

	generateBaseCommand() {
		let baseCommand = this.command;

		if(this.parent !== null)
			baseCommand = this.parent.generateBaseCommand() + ':' + baseCommand;
		else if(typeof this.rootCommand === 'string')
			baseCommand = this.rootCommand + ' ' + baseCommand;

		return baseCommand;
	}

	executeCommand(command) {
		const rootDirectory = this.resolveActiveRootDirectory();

		if(typeof rootDirectory !== 'string')
			return atom.notifications.addError('Woops!', {
				description: 'Could not resolve working directory! Try opening a file.',
				dismissable: true
			});

		command = command.trim();

		exec(`cd "${rootDirectory}" && ${command}`, (err, stdout, stderr) => {
			if(!_.isEmpty(err) || !_.isEmpty(stderr)) {
				atom.notifications.addError(`The command "${command}" failed to executeCommand!`, {
					description: (err ? err.message : stderr),
					dismissable: true
				});
			} else if(!_.isEmpty(stdout)) {
				if(typeof this.outputView !== 'undefined' && typeof this.outputView !== null) {
					this.outputView.update({ output: stdout, command: command });
					this.outputView.resetAutoDismiss();
				} else {
					this.outputView = new CommandOutputView({
						output: stdout,
						command: command
					});

					const outputView = atom.workspace.addBottomPanel({
						item: this.outputView.element
					});
					outputView.getElement().classList.add('laravel-helper');

					this.outputView.element.addEventListener('close', () => {
						outputView.getElement().classList.add('close-panel');
						setTimeout(() => {
							outputView.destroy();
						}, 1000);
					});
				}
			}
		});
	}

	/**
	 * Try to resolve the project directory from the currently active editor
	 */
	resolveActiveRootDirectory() {
		const projectPaths = atom.project.getPaths();
		let activeTextEditor = atom.workspace.getActiveTextEditor();
		let activeProject = null;

		if(_.isEmpty(projectPaths) || _.isEmpty(activeTextEditor))
			return null;

		activeTextEditor = activeTextEditor.buffer.file.path;

		projectPaths.forEach(p => {
			if(activeTextEditor.startsWith(p))
				activeProject = p;
		});

		return activeProject;
	}
}
