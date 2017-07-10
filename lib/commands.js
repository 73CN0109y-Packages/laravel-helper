'use babel';

import Command from './_Command';

export default [
	new Command({
		value: 'Cache',
		rootCommand: 'php artisan',
		subCommands: [
			new Command('Clear'),
			new Command({
				value: 'Forget',
				params: ['Key', 'Store?'],
				argFormat: '$key $store'
			}),
			new Command('Table')
		]
	}),
	new Command({
		value: 'Database',
		rootCommand: 'php artisan',
		command: 'db',
		subCommands: [
			new Command('Seed')
		]
	}),
	new Command({
		value: 'Generate Key',
		rootCommand: 'php artisan',
		command: 'key:generate'
	}),
	new Command({
		value: 'Make',
		rootCommand: 'php artisan',
		subCommands: [
			new Command('Auth'),
			new Command({
				value: 'Command',
				params: ['Name', {
					type: 'text',
					value: 'Command',
					default: 'command:name',
				}],
				argFormat: '$name --command=$command'
			}),
			new Command({
				value: 'Controller',
				params: ['Name', 'Model?', {
					type: 'checkbox',
					value: 'Resource',
					default: false
				}, 'Parent?'],
				argFormat: '$name --model=$model --resource=$resource --parent=$parent'
			}),
			new Command({
				value: 'Event',
				params: ['Name'],
				argFormat: '$name'
			}),
			new Command({
				value: 'Job',
				params: ['Name', {
					type: 'checkbox',
					value: 'Sync',
					default: false,
				}],
				argFormat: '$name --sync=$sync'
			}),
			new Command({
				value: 'Listener',
				params: ['Name', 'Event', {
					type: 'checkbox',
					value: 'Queued',
					default: true
				}],
				argFormat: '$name --event=$event --queued=$queued'
			}),
			new Command({
				value: 'Mail',
				params: ['Name', 'Markdown?'],
				argFormat: '$name --markdown=$markdown'
			}),
			new Command({
				value: 'Middleware',
				params: ['Name'],
				argFormat: '$name'
			}),
			new Command({
				value: 'Migration',
				params: ['Name', {
					type: 'radio',
					value: 'Type',
					options: ['Create', 'Table'],
					default: 'create'
				}, 'Table Name?'],
				argFormat: '$name --$type=$tableName'
			}),
			new Command({
				value: 'Model',
				params: ['Name', {
					type: 'checkbox',
					value: 'Migration',
					default: false
				}, {
					type: 'checkbox',
					value: 'Controller',
					default: false
				}, {
					type: 'checkbox',
					value: 'Resource',
					default: false
				}],
				argFormat: '$name --migration=$migration --controller=$controller --resource=$resource'
			}),
			new Command({
				value: 'Notification',
				params: ['Name', 'Markdown?'],
				argFormat: '$name --markdown=$markdown'
			}),
			new Command({
				value: 'Policy',
				params: ['Name', 'Model?'],
				argFormat: '$name --model=$model'
			}),
			new Command({
				value: 'Provider',
				params: ['Name'],
				argFormat: '$name'
			}),
			new Command({
				value: 'Request',
				params: ['Name'],
				argFormat: '$name'
			}),
			new Command({
				value: 'Seeder',
				params: ['Name'],
				argFormat: '$name'
			}),
			new Command({
				value: 'Test',
				params: ['Name', {
					type: 'checkbox',
					value: 'Unit',
					default: false
				}],
				argFormat: '$name --unit=$unit'
			})
		]
	}),
	new Command({
		value: 'Migrate',
		rootCommand: 'php artisan',
		subCommands: [
			new Command('Install'),
			new Command('Refresh'),
			new Command('Reset'),
			new Command('Rollback'),
			new Command('Status')
		]
	}),
	new Command({
		value: 'Queue',
		rootCommand: 'php artisan',
		subCommands: [

		]
	}),
	new Command({
		value: 'Route',
		rootCommand: 'php artisan',
		subCommands: [
			new Command('Cache'),
			new Command('Clear'),
			new Command('List')
		]
	}),
	new Command({
		value: 'View Clear',
		rootCommand: 'php artisan',
		command: 'view:clear'
	})
];
