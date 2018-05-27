'use babel';
/** @jsx etch.dom */

let _;
import etch from 'etch';
import {TextEditor} from 'atom';

export default class CommandInputBox {
	constructor(props) {
		this.props = props;
		this.state = {};

		etch.initialize(this);
	}

	confirm(e) {
		this.cancel(e, true);
	}

	cancel(e, confirm = false) {
		let args = Object.keys(this.refs).reduce((prev, cur) => {
			// Atom Element
			if(typeof this.refs[cur].nodeName === 'undefined') {
				prev[cur] = this.refs[cur].getText() || this.refs[cur].getPlaceholderText();
			} else {
				if(this.refs[cur].nodeName === 'INPUT') {
					switch(this.refs[cur].type.toLowerCase()) {
						case 'checkbox':
							prev[cur] = this.refs[cur].checked;
							break;
						case 'radio':
							prev[cur] = this.refs[cur].value;
							break;
						default:
							console.error(this.refs[cur].type);
							break;
					}
				}
			}

			return prev;
		}, {});

		if(typeof _ === 'undefined')
			_ = require('lodash');

		_.merge(args, this.state);

		Object.keys(args).forEach(oldKey => {
			let newKey = oldKey.replace(/\s(\w)/ig, (match, p1) => {
				return p1.toUpperCase();
			});

			if(newKey.endsWith('?') && !newKey.endsWith('\\?'))
				newKey = newKey.substr(0, newKey.length - 1);

			if(oldKey !== newKey) {
				Object.defineProperty(args, newKey, Object.getOwnPropertyDescriptor(args, oldKey));
				delete args[oldKey];
			}

			args[newKey] = {
				key: oldKey,
				value: args[newKey]
			};
		});

		const event = new CustomEvent('close', {
			detail: {
				didConfirm: confirm,
				args: args
			}
		});
		this.element.dispatchEvent(event);
	}

	requiredField() {
		return (
			<span class='required'>*</span>
		);
	}

	radioChanged(e, o) {
		this.state[o.toLowerCase()] = e.target.value;
	}

	render() {
		const fields = this.props.params.map(param => {
			if(typeof param !== 'string') {
				const isRequired = (typeof param.required === 'boolean' ? param.required : true);

				if(param.type === 'text') {
					return (
						<div>
							<label>{param.value}{isRequired?this.requiredField():null}</label>
							<TextEditor ref={param.value.toLowerCase()} mini={true}
								placeholderText={param.default || ''} name={param.value.toLowerCase()}  />
						</div>
					);
				} else if(param.type === 'checkbox') {
					return (
						<div>
							<label>{param.value}</label>
							<input ref={param.value.toLowerCase()} type="checkbox"
								checked={param.default} name={param.value.toLowerCase()} />
						</div>
					);
				} else if(param.type === 'radio') {
					this.state[param.value.toLowerCase()] = param.default;

					const radios = param.options.map(opt => {
						const optValue = opt.replace(/\s+/ig, '');

						return (
							<div class="radio-button">
								<label htmlFor={param.value.toLowerCase() + opt}>{opt}</label>
								<input type='radio' name={param.value.toLowerCase()}
									id={param.value.toLowerCase() + optValue} value={optValue}
									checked={this.state[param.value.toLowerCase()] === opt}
									onChange={(e) => this.radioChanged(e, param.value)} />
							</div>
						);
					});

					return (
						<div>
							<label style="display: block;">{param.value}</label>
							{radios}
						</div>
					);
				}
			}

			let paramName = param;
			const isRequired = !(param.endsWith('?') && !param.endsWith('\\?'));

			if(param.endsWith('?') && !param.endsWith('\\?'))
				paramName = paramName.slice(0, -1)

			return (
				<div>
					<label>{paramName}{isRequired?this.requiredField():null}</label>
					<TextEditor ref={param.toLowerCase()} mini={true} name={param.toLowerCase()} />
				</div>
			);
		});

		return (
			<div class="laravel-helper command-input">
				<h3>{this.props.parentValue} <span class="header-seperator">-></span> {this.props.value}</h3>

				{fields}

				<div class="text-right">
					<div class="inline-block">
						<button class="btn btn-error" on={{ click: this.cancel }}>Cancel</button>
					</div>

					<div class="inline-block">
						<button class="btn btn-success" on={{ click: this.confirm }}>Execute</button>
					</div>
				</div>
			</div>
		);
	}

	update(props) {
		return etch.update(this);
	}

	async destroy() {
		await etch.destroy(this);
	}
}
