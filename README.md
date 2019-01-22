# Laravel Helper

Interactive helper for executing Laravel 5 artisan commands

## Custom Commands
**Warning: This "documentation" might be incorrect in some places. If you find anything incorrect or something isn't working how you think it should, simply create an issue and I'll try to sort it out**

This package now has the ability to load custom commands via an external JavaScript file.
If you would like to use your own commands, simply follow these steps to get started;

1) Create an empty JS file anywhere you like and copy it's location to your clipboard.

    Location example: `C:\Users\Admin\Desktop\MyLaravelCommands.js`

2) Open the settings for this package and paste the location of your command file into the "Command File Path" box.
3) Back in your custom command file, start writing commands and each time your use the Laravel helper menu, it will automatically detect new changes. (See below for syntax and examples)


### Command Syntax
You can define commands in 2 different ways;

1) By simply using a string, or;
2) By specifying a full object

The first will allow you to quickly specify commands. It will use this value for the name that shows in the dropdown menu and for the command it should execute.

The latter however will give you full control over the command definition.

I'll specify the structure for a command first and after this, I'll give some examples.

#### Command Defintion

| Key         | Type          | Required | Description |
| ---         | ---           | ---      | --- |
| value       | string        | Yes      | The name to show in the dropdown menu. This will also be the *command* if no *command* is provided |
| rootCommand | string        | No       | This is used in conjunction with the *command* parameter or a sub-commands *command* value |
| command     | string        | No       | This will get prefixed onto the *rootCommand* |
| subCommands | Command[]     | No       | An array of child commands. Every command specified here will be prefixed with this *rootCommand* |
| argFormat   | string        | No       | The format any arguments should be placed in |
| isRaw       | boolean       | No       | If true, it will ignore the parents *rootCommand* and simply run the *command* you specify |
| params      | string\|Parameter[] | No | |

#### Parameter Definition
| Key         | Type          | Required | Description |
| ---         | ---           | ---      | --- |
| type | string | Yes | Can be "text", "checkbox" or "radio" |
| value | string | Yes | The name of the field and what will be shown as the label (The camelCase value of this should match something in the argFormat) |
| default | any | No | What this value should be by default (If type is "text", it sets the placeholder) |
| required | boolean | No | Is this a required field? |
| options | string[] | If type is "radio" |  |

### Examples
#### Simple Commands
```JS
// Make sure you wrap every command as an array
// And yes, having some commands a simple string and others an object will work
// If you use a string instead of an object, it will show exactly what you put in the dropdown
module.exports = [
    // Will simply run the command "bash" in the console
    'bash',

    // This is equivalent to above
    {
        value: 'bash'
    },

    // This will show "Wipe Database" in the dropdown and execute the "command"
    {
        value: 'Wipe Database',
        command: 'php artisan migrate:reset'
    },
];
```

#### Nested Commands
**NOTE: With nested commands, the parents "Value" is prefixed onto the childs "command"**

```JS
module.exports = [
    {
        // This is the "base" command
        // All subCommands will get prefixed with the "rootCommand"
        value: 'Database',
        rootCommand: 'php artisan',
        subCommands: [
            // Show as "migrate" and execute "php artisan migrate"
            'migrate',

            // Show as "Wipe" and execute "php artisan migrate:reset"
            {
                value: 'Wipe',
                command: 'migrate:reset'
            },

            // Show as "Dump Autoload" and execute "composer dump-a"
            // Note how this doesn't get prefixed with the parents rootCommand because we specify isRaw=true
            {
                value: 'Dump Autoload',
                command: 'composer dump-a'
                isRaw: true
            }
        ]
    },

    // In this example, we don't specify a rootCommand
    // In this case, we have to specify the full command on each of the children
    // This can be handy if you want to group a bunch of package commands together
    {
        value: 'Database',
        rootCommand: 'php artisan',
        subCommands: [
            'migrate',

            {
                value: 'Refresh',
                command: 'php artisan migrate:refresh',
                isRaw: true
            }
        ]
    }
];
```

#### Command Arguments
What if a command expects some arguments - like `php artisan make:controller`

```JS
module.exports = [
    // We start of by defining this as we have before
    {
        value: 'Make',
        rootCommand: 'php artisan',
        subCommands: [
            {
                value: 'Controller',
                command: 'make:controller',

                // This is a list of input definitions that will be used to generate the UI
                // when you select this command from the dropdown.
                params: [
                    // If you specify a parameter definition simply as a string
                    // a text input will be displayed

                    'Name',
                    'Model?', // This argument is optional
                    {
                        type: 'checkbox',
                        value: 'Resource',
                        default: true // This will be checked by default
                    },
                    {
                        type: 'text',
                        value: 'Parent',
                        // Because this is a text input, this will be the placeholder
                        default: 'Something',
                        required: false // This argument is optional
                    }
                ],

                // Here is the format this command expects the arguments to be
                // You can see that because "resource" is a checkbox, we specify that it's optional here
                // The other arguments are specified as optional in the parameter definition above
                argFormat: '$name --model=$model --resource? --parent=$parent'
            },

            // Radio groups & Advanced argument formats
            {
                value: 'Migration',
                command: 'make:migration',
                params: [
                    'Name',
                    {
                        type: 'radio',
                        value: 'Type',
                        options: ['Create', 'Table'],
                        default: 'create'
                    },
                    'Table Name?'
                ],
                // Here is a great example of being able to place your param values anywhere within the argument
                // If we input;
                // Name: create_users_table
                // Type: Create
                // Table Name: users
                // It would execute this command:
                // php artisan make:migration create_users_table --create=users
                argFormat: '$name --$type=$tableName'
            }
        ]
    },

    // Bonus
    // Because of how (poorly) I've written this work, it might work unexpectedly when you add your own commands

    // You would expect this to execute "git commit -m some message here"
    // But it really does "git:commit -m some message here"
    {
        value: 'Git',
        subCommands: [
            {
                value: 'Commit',
                params: ['message'],
                argFormat: '-m $message'
            }
        ]
    }


    // Using isRaw and specifying the "full" command on each sub-command can fix this
    {
        value: 'Git',
        subCommands: [
            // This will execute "git commit -m some message here"
            {
                value: 'Commit',
                command: 'git commit',
                isRaw: true,
                params: ['message'],
                argFormat: '-m $message'
            },

            // This will execute "git push"
            {
                value: 'Push',
                command: 'git push',
                isRaw: true,
            }
        ]
    }
];
```


## Preview

![Laravel Helper](https://user-images.githubusercontent.com/10562383/28160864-ce40116c-6804-11e7-8dc1-1e66b8017d5e.gif)
