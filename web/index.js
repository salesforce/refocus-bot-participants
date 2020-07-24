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

const React = require('react');
const ReactDOM = require('react-dom');
const App = require('./components/App.jsx');
const env = require('../config.js').env;
const config = require('../config.js')[env];
const botName = require('../package.json').name;
const bdk = require('@salesforce/refocus-bdk')(config, botName);
const serialize = require('serialize-javascript');
const roomId = bdk.getRoomId();
const ZERO = 0;
const ERR_NO_ROLE_NAME = 1;
const ERR_SPACE_IN_ROLE_LABEL = 2;
const ERR_ROLE_ALREADY_EXISTS = 3;
const currentUser = {
  name: bdk.getUserName(),
  id: bdk.getUserId(),
  email: bdk.getUserEmail(),
  fullName: bdk.getUserFullName(),
};

let roles = [];
const currentRole = {};
let rolesBotDataId;
let showingError = 0;

/* eslint-disable no-use-before-define */
/**
 * This is the main function to render the UI
 *
 * {Integer} roomId - Room Id that is provided from refocus
 * @param {Object} _users - All users
 * @param {Array} _roles - All the roles
 * @param {Object} _currentRole - The current role of user
 * @param {Object} _currentUser - The current user on page
 */
function renderUI(_users, _roles, _currentRole, _currentUser) {
  ReactDOM.render(
    <App
      roomId={roomId}
      users={_users}
      roles={_roles}
      showingError={showingError}
      currentRole={_currentRole}
      currentUser={_currentUser}
      createRole={createRole}
      deleteRole={deleteRole}
    />,
    document.getElementById(botName)
  );
}

/* eslint-disable no-use-before-define */
/* eslint-disable no-magic-numbers */
/* eslint-disable no-magic-numbers */

/* eslint-disable prefer-spread */
/**
 * Creates a role
 * @returns {Promise<any>}
 */
function createRole() {
  const roleName = document.getElementById('roleName');
  const roleLabel = document.getElementById('roleLabel');

  const nameString = roleName.value;
  const labelString = roleLabel.value === '' ?
    nameString.replace(/ /g, '') : roleLabel.value;

  return new Promise((resolve) => {
    const validRole = isValidRole(nameString, labelString);
    if (validRole === 0) {
      const highestOrder = Math.max.apply(Math, roles.map((o) => {
        return o.order;
      }));
      roles.push({
        name: nameString, label: labelString,
        order: highestOrder + 1
      });
      bdk.changeBotData(rolesBotDataId, serialize(roles)).then(() => {
        const eventType = {
          'type': 'Event',
        };

        bdk.createEvents(
          roomId,
          'New Role Created: ' +
          `${nameString} (${labelString})`,
          eventType
        );

        roleName.value = '';
        roleLabel.value = '';
        showingError = validRole;
        resolve(false);
        renderUI(null, roles, currentRole, currentUser);
      });
    } else {
      showingError = validRole;
      resolve(true);
      renderUI(null, roles, currentRole, currentUser);
    }
  });
}

/**
 * Delete role
 *
 * @param {number} index - role to be removed
 */
function deleteRole(index) {
  const role = roles[index];
  roles.splice(index, 1);

  bdk.changeBotData(rolesBotDataId, serialize(roles))
    .then(() => {
      const eventType = {
        'type': 'Event',
      };
      bdk.createEvents(roomId,
        'Role Deleted: ' + `${role.name} (${role.label})`, eventType);
    });
}

/**
 * Check if role name and label are valid.
 *
 * @param {String} roleName
 * @param {String} roleLabel
 * @returns {number}
 */
function isValidRole(roleName, roleLabel) {
  if (!roleName.length) {
    return ERR_NO_ROLE_NAME;
  } else if (/\s/.test(roleLabel)) {
    return ERR_SPACE_IN_ROLE_LABEL;
  }

  let valid = ZERO;
  roles.forEach((role) => {
    if (role.name === roleName || role.label === roleLabel) {
      valid = ERR_ROLE_ALREADY_EXISTS;
    }
  });

  return valid;
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
      const userChange = {};
      userChange[detail.context.user.id] = {
        name: detail.context.user.name,
        id: detail.context.user.id,
        email: detail.context.user.email,
        isActive: detail.context.isActive,
        fullName: detail.context.user.fullName,
      };
      renderUI(userChange, roles, currentRole, currentUser);
    }
  }
}

/**
 * When a refocus.room.settings is dispatch it is handled here.
 *
 * @param {Object} Room - Room object that was dispatched
 */
function handleSettings(room) {
  bdk.log.debug('Settings Change Event received: ', room);
}

/**
 * When a refocus.bot.data is dispatch it is handled here.
 *
 * @param {Object} BotData - Bot Data object that was dispatched
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
 * @param {Object} action - Bot Action object that was dispatched
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
      const assignedParticipants = data.body.filter((bd) => bd.name ===
        'assignedParticipants')[ZERO];
      if (!assignedParticipants) {
        bdk.createBotData(roomId, botName,
          'assignedParticipants', serialize({}))
          .then(() => console.log(`assigned participant data created - room ${roomId}`));
      } else {
        console.log(`participants already exist for room ${roomId}`);
      }

      const rolesBotData = data.body.filter((bd) => bd.name ===
        'participantsBotRoles')[ZERO];
      roles = rolesBotData ?
        JSON.parse(rolesBotData.value) : rolesFromSettings;
      if (rolesBotData) {
        rolesBotDataId = rolesBotData.id;
      } else {
        /* eslint-disable no-return-assign */
        bdk.createBotData(roomId, botName,
          'participantsBotRoles', serialize(rolesFromSettings))
          .then((res) => rolesBotDataId = res.body.id);
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
