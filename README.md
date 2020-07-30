# Participants-Bot

This a bot to be used in [Refocus Rooms](https://github.com/salesforce/refocus) to see what users are currently in the a room and assigned them different hats (roles).

[![Build Status](https://travis-ci.org/salesforce/refocus-bot-participants.svg?branch=master)](https://travis-ci.org/salesforce/refocus-bot-participants.svg)

## Features
* List of active user
* Creates events for users
* Assign customizable roles to users

## Getting Started
These instructions will enable you to have a copy of this project up and running on your local machine for development and testing purposes.

### Prerequisites
* [Node.js](https://nodejs.org/en/)

### Env Variables
Note: If you want to test this locally you will need some environment variables:
* ```API_TOKEN``` - Used for Requests to Refocus. Created in refocus/tokens/new.
* ```SOCKET_TOKEN``` (Returned Upon Installation) - Used for Socket Connection.
* ```NODE_ENV (defaults to 'dev')``` - Used to determine which instance of Refocus to install the bot.
* ```REFOCUS_URL``` (OPTIONAL) - Used to specify which refocus instance to point to.

### Running Locally
* Clone this repo
* ```npm login``` (login to npm to use the private salesforce-bdk)
* ```npm update```
* ```npm install```
* ```npm start```
* Test locally (default port 5000)

## Required Refocus Room Settings
* participantsRoles - Array containing the roles you want to assign users too.

### Example Room Settings
```javascript
"settings": {
	"participantsRoles": [
	  {
	    "name": "Incident Commander",
	    "label": "IC",
	    "order": 1
	  },
	  {
	    "name": "Troubleshooting and Data Mining",
	    "label": "TAD",
	    "order": 20
	  }
	]
}
```

## Contributing
If you have any ideas on how this project could be improved, please feel free. The steps involved are:
* Fork the repo on GitHub.
* Clone this project to your machine.
* Commit changes to your own branch.
* Push your work back up to your fork.
* Submit a Pull Request so we can review it!

## Release History
Follows [semantic versioning](https://docs.npmjs.com/getting-started/semantic-versioning#semver-for-publishers)
* 1.0.0 Readme and iFrame friendly
* 1.0.1 Removed public folder to reduce size
* 1.1.0 Included fullName functionality
* 1.1.1 Fixed fullName bug
* 1.1.2 Remove user entrance and exit code
* 1.1.2 Clear User
* 1.1.3 Add external user
* 1.1.4 Remove User Event
* 1.1.5 Remove extra scripts
* 1.1.6 Add env variable for refocus url
* 1.1.7 Use Serialize instead of stringify
* 1.1.8 Uglify for production.
* 1.1.9 Added display name.
* 1.1.10 Fix bot name missing for bdk getBotData.
* 1.1.11 Functionality to create & delete roles.
* 1.1.12 Create events with more consistent messages.
* 1.1.13 Made role label optional, added error message.
* 1.1.14 Clean up config.js.
* 1.1.15 Upgrade packages from npm audit findings.
* 1.1.16 Updated frontend bdk instantiations for realtime app.
* 1.1.17 Updated bdk to avail of new getActiveUsers code change.
* 1.2.0  New bot data aggregating all the participant roles.
