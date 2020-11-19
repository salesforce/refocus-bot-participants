/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * /web/index.js
 *
 * This code handles initial render of the bot and any re-renders triggered
 * from javascript events.
 */

import App from './components/App.jsx';
import Roles from './state/Roles';
import Users from './state/Users';
const React = require('react');
const ReactDOM = require('react-dom');
const env = require('../config.js').env;
const config = require('../config.js')[env];
const botName = require('../package.json').name;
const bdk = require('@salesforce/refocus-bdk')(config, botName);
const roleManager = new Roles(bdk, botName);
const userManager = new Users(bdk, botName);
const roomId = bdk.getRoomId();

let roles = {};
let users = [];

/**
 * This is the main function to render the UI
 * @param {Object} _currentRole - The current role of user
 * @param {Object} _currentUser - The current user on page
 */
async function renderUI() {
  ReactDOM.render(
    <App
      users={users}
      roles={roles}
    />,
    document.getElementById(botName)
  );
}

/**
 * When a refocus.events is dispatch it is handled here.
 *
 * @param {Event} event - The most recent event object
 */
function handleEvents(event) {
  const detail = event.detail;
  if (detail.roomId === roomId) {
    bdk.log.debug('Event received: ', event);
    if (detail.context && detail.context.type === 'User') {
      const user = {
        name: detail.context.user.name,
        id: detail.context.user.id,
        email: detail.context.user.email,
        isActive: detail.context.isActive,
        fullName: detail.context.user.fullName,
      };
      userManager.addUser(user);
    }
  }
}

/**
 * When a refocus.room.settings is dispatch it is handled here.
 *
 * @param {Object} room - Room object that was dispatched
 */
function handleSettings(room) {
  bdk.log.debug('Settings Change Event received: ', room);
}

/**
 * When a refocus.bot.data is dispatch it is handled here.
 *
 * @param {Object} data - Bot Data object that was dispatched
 */
function handleData(data) {
  if (data.detail.roomId === roomId) {
    bdk.log.debug('Bot Data Event Received: ', data.detail);
    switch (data.detail.name) {
      case 'assignedParticipants': {
        roles = JSON.parse(data.detail.value);
        break;
      }
      case 'listOfRoomUsers': {
        users = JSON.parse(data.detail.value);
        break;
      }
      default: break;
    }

    renderUI();
  }
}

/**
 * When a refocus.bot.actions is dispatch it is handled here.
 *
 * @param {Object} action - Bot Action object that was dispatched
 */
function handleActions(action) {
  if (action.detail.roomId === roomId) {
    bdk.log.debug('Action Received: ', action.detail);
  }
}

/**
 * Initialize roles and users lists, then render the React UI
 */
async function init() {
  let storedRoles = await roleManager.getRoles();
  const storedUsers = await userManager.getUsers() || [];
  if (storedRoles === undefined) {
    storedRoles = await roleManager.createRolesBotData();
  }
  roles = storedRoles;
  users = storedUsers;
  renderUI();
}

document.getElementById(botName)
  .addEventListener('refocus.events', handleEvents, false);
document.getElementById(botName)
  .addEventListener('refocus.room.settings', handleSettings, false);
document.getElementById(botName)
  .addEventListener('refocus.bot.data', handleData, false);
document.getElementById(botName)
  .addEventListener('refocus.bot.actions', handleActions, false);

init();
