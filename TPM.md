# Terminal Plugin Manager
Terminal's plugins and extensions manager.
## What is a plugin?
A plugin is an add-on to the terminal that allows you to add a command/style/script.
## How to add a plugin?
Using the command:
```
tpm install [name]
```
[name] - Plugin name
#### Options
`--save` - To save the plug-ins in the browser storage for automatic download at each login. (Also saved in account if connected.)
## Security
Each plug-in is required to own a security certificate which confirms that the plug-in has been tested and approved, a plug-in without a security certificate can be installed but will require additional consent.
*Plugin that has a fake security certificate will not be installed.*
## Plugin content
- Script - Commands
##### In addition, there is content according to security levels
### Low
A basic level of security obtained for each approved plugin.
- Style - Added css design file.
### Medium
Medium security.
- HTML - Adds additional html code to the page.
### High
Highest level of security.
- JavaScript - Adds another file with js.