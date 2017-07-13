'use babel';
/** @jsx etch.dom */

let _;
import etch from 'etch';

export default class CommandOutputView {
    constructor(props) {
        this.props = props;
        this.state = {
            closeAfter: 5000,
            closePercent: 0,
            isHovering: false,
        };
        this.autoDismiss = undefined;
        this.closing = false;

        etch.initialize(this);

        this.resetAutoDismiss();
    }

    close() {
        this.closing = true;
        this.cancelAutoDismiss();

        const event = new CustomEvent('close', {});
		this.element.dispatchEvent(event);
    }

    hover() {
        this.cancelAutoDismiss();

        this.update({ isHovering: true });
    }

    leave() {
        this.update({ isHovering: false });

        if(typeof this.autoDismiss === 'undefined')
            this.incrementDismiss();
    }

    render() {
        const dismissBarStyle = {
            width: (100 - this.state.closePercent) + '%',
            transition: 'width ease-in-out ' + ((this.state.closeAfter / 100) / 1000) + 's'
        };
        const autoCloseTimer = (this.state.closeAfter - (this.state.closeAfter / 100 * this.state.closePercent));

        return (
            <div class='laravel-helper command-output' onMouseOver={this.hover} onMouseLeave={this.leave}>
                <div class="header">
                    <h2>
                        Command Output
                        <span class="command">{this.props.command}</span>
                    </h2>

                    <div class="close" on={{ click: this.close }}>
                        &times;
                    </div>

                    <div class="autoclose-timer">
                        Auto-Close in {(autoCloseTimer / 1000).toFixed(1)}s
                    </div>

                    <div class="dismiss-bar" style={dismissBarStyle}></div>
                </div>

                <div class="content">
                    {this.props.output}
                </div>
            </div>
        );
    }

    update(props) {
		if(typeof _ === 'undefined')
			_ = require('lodash');

        _.assign(this.props, props);

        return etch.update(this);
    }

    async destroy() {
        await etch.destroy(this);
    }

    cancelAutoDismiss() {
        if(typeof this.autoDismiss === 'undefined')
            return;

		this.state.closePercent = 0;
        clearTimeout(this.autoDismiss);
        delete this.autoDismiss;
        this.autoDismiss = undefined;
    }

    resetAutoDismiss() {
        if(this.closing) return;

        this.cancelAutoDismiss();
        this.autoDismiss = setTimeout(this.incrementDismiss.bind(this), this.state.closeAfter / 100);
    }

    incrementDismiss() {
        if(this.closing) return;

        if(this.state.closePercent >= 100)
            return this.close();

        this.update({
            closePercent: this.state.closePercent++
        });

        this.autoDismiss = setTimeout(this.incrementDismiss.bind(this), this.state.closeAfter / 100);
    }
}
