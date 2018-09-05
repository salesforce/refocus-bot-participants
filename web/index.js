/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * /web/index.js
 *
 * This code handles intial render of the bot and any rerenders triggered
 * from javascript events.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const moment = require('moment');
const App = require('./components/App.jsx');
const env = require('../config.js').env;
const config = require('../config.js')[env];
const bdk = require('@salesforce/refocus-bdk')(config);
const serialize = require('serialize-javascript');
const botName = require('../package.json').name;
const roomId = bdk.getRoomId();
const ZERO = 0;
const currentUser = {
  name: bdk.getUserName(),
  id: bdk.getUserId(),
  email: bdk.getUserEmail(),
  fullName: bdk.getUserFullName(),
};

let rolesBotDataId;

let roles = [];
const currentRole = {};

/**
 * This is the main function to render the UI
 *
 * {Integer} roomId - Room Id that is provided from refocus
 * @param {Object} _users - All users
 * @param {Array} _roles - All the roles
 * @param {Object} _currentRole - The current role of user
 * @param {Object} _currentUser - The current user on page
 */
function renderUI(_users, _roles, _currentRole, _currentUser){
  ReactDOM.render(
    <App
      roomId={ roomId }
      users={ _users }
      roles={ _roles }
      currentRole={ _currentRole }
      currentUser={ _currentUser }
      createRole= { createRole }
    />,
    document.getElementById(botName)
  );
}

function createRole() {
  const roleName = document.getElementById('roleName');
  const roleLabel = document.getElementById('roleLabel');

  if (isValidRole(roleName.value, roleLabel.value)) {
    const highestOrder = Math.max.apply(Math, roles.map(function(o) { return o.order; }))
    roles.push({name: roleName.value, label: roleLabel.value, order: highestOrder + 1})
    bdk.changeBotData(rolesBotDataId, serialize(roles)).then(() => {
      roleName.value = '';
      roleLabel.value = '';
    });
  }
}

function isValidRole(roleName, roleLabel) {
  roles.forEach((role) => {
    if (role.roleName === roleName || role.roleLabel === roleLabel) {
      return false;
    }
  })

  return true;
}

/**
 * When a refocus.events is dispatch it is handled here.
 *
 * @param {Event} event - The most recent event object
 */
function handleEvents(event) {
  if (event.detail.roomId === roomId) {
    bdk.log.debug('Event received: ', event);
    if ((event.detail.context) &&
      (event.detail.context.type === 'User')) {
      const userChange = {};
      userChange[event.detail.context.user.id] = {
        name: event.detail.context.user.name,
        id: event.detail.context.user.id,
        email: event.detail.context.user.email,
        isActive: event.detail.context.isActive,
        fullName: event.detail.context.user.fullName,
      };
      renderUI(userChange, roles, currentRole, currentUser);
    }
  }
}

/**
 * When a refocus.room.settings is dispatch it is handled here.
 *
 * @param {Room} room - Room object that was dispatched
 */
function handleSettings(room) {
  bdk.log.debug('Settings Change Event received: ', room);
}

/**
 * When a refocus.bot.data is dispatch it is handled here.
 *
 * @param {BotData} data - Bot Data object that was dispatched
 */
function handleData(data) {
  if (data.detail.roomId === roomId) {
    bdk.log.debug('Bot Data Event Received: ', data.detail);
    if (data.detail.name === 'participantsBotRoles') {
      roles = JSON.parse(data.detail.value);
    } else {
      const label = data.detail.name.replace('participants', '');
      if (!currentRole[label]) {
        currentRole[label] = {};
        currentRole[label].id = data.detail.id;
      }
      currentRole[label].value = data.detail.value;
    }

    renderUI(null, roles, currentRole, currentUser);
  }
}

/**
 * When a refocus.bot.actions is dispatch it is handled here.
 *
 * @param {BotAction} action - Bot Action object that was dispatched
 */
function handleActions(action) {
  if (action.detail.roomId === roomId) {
    bdk.log.debug('Action Received: ', action.detail);
  }
}

/**
 * The actions to take before load.
 */
function init() {
  let rolesFromSettings = [];

  bdk.findRoom(roomId)
    .then((res) => {
      rolesFromSettings = (res.body.settings &&
        (res.body.settings.participantsRoles !== undefined)) ?
        res.body.settings.participantsRoles : [];
      return bdk.getBotData(roomId, botName);
    })
    .then((data) => {
      const rolesBotData = data.body.filter((bd) => bd.name === 'participantsBotRoles')[ZERO];
      roles = rolesBotData ? JSON.parse(rolesBotData.value) : rolesFromSettings;
      if (!rolesBotData) {
        bdk.createBotData(roomId, botName,
          'participantsBotRoles', serialize(rolesFromSettings))
        .then((res) => rolesBotDataId = res.body.id);
      } else {
        rolesBotDataId = rolesBotData.id;
      }

      roles.forEach((role) => {
        currentRole[role.label] = data.body
          .filter((bd) => bd.name === 'participants' + role.label)[ZERO];
      });

      return bdk.getActiveUsers(roomId);
    })
    .then((users) => {
      renderUI(users, roles, currentRole, currentUser);
    });
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
