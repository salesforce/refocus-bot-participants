# Participants-Bot
This a bot to be used in [Refocus Rooms](https://github.com/salesforce/refocus) to see what users are currently in the a room and assigned them different hats (roles).

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
* ```API_TOKEN``` - Used for Requests to Refocus. Created in refoucs/tokens/new.
* ```SOCKET_TOKEN``` (Returned Upon Installation) - Used for Socket Connection.
* ```NODE_ENV (defaults to 'dev')``` - Used to determine which instance of Refocus to install the bot.

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