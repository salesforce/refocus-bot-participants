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

require('../web/dist/public/styles/salesforce-lightning-design-system.css');

const React = require('react');
const ReactDOM = require('react-dom');
const moment = require('moment');
const App = require('./components/App.jsx');
const env = process.env.NODE_ENV || 'dev';
const config = require('../config.js')[env];
const bdk = require('@salesforce/refocus-bdk')(config);
const botName = require('../package.json').name;
const roomId = bdk.getRoomId();
const ZERO = 0;
const currentUser = {
  name: bdk.getUserName(),
  id: bdk.getUserId(),
  email: bdk.getUserEmail(),
};
let roles = [];
const currentRole = {};

/**
 * When a refocus.events is dispatch it is handled here.
 *
 * @param {Event} event - The most recent event object
 */
function handleEvents(event) {
  console.log(botName + ' Event Activity', event);
  if ((event.detail.context) &&
    (event.detail.context.type === 'User')) {
    const userChange = {};
    userChange[event.detail.context.user.id] = {
      name: event.detail.context.user.name,
      id: event.detail.context.user.id,
      email: event.detail.context.user.email,
      isActive: event.detail.context.isActive,
    };
    renderUI(userChange, roles, currentRole, currentUser);
  }
}

/**
 * When a refocus.room.settings is dispatch it is handled here.
 *
 * @param {Room} room - Room object that was dispatched
 */
function handleSettings(room) {
  console.log(botName + ' Room Activity', room);
}

/**
 * When a refocus.bot.data is dispatch it is handled here.
 *
 * @param {BotData} data - Bot Data object that was dispatched
 */
function handleData(data) {
  console.log(botName + ' Bot Data Activity', data);
  const label = data.detail.name.replace('participants', '');
  if (!currentRole[label]) {
    currentRole[label] = {};
    currentRole[label].id = data.detail.id;
  }
  currentRole[label].value = data.detail.value;
  renderUI(null, roles, currentRole, currentUser);
}

/**
 * When a refocus.bot.actions is dispatch it is handled here.
 *
 * @param {BotAction} action - Bot Action object that was dispatched
 */
function handleActions(action) {
  console.log(botName + ' Bot Action Activity', action);
}

/**
 * When the users leave/reloads the page, send an event to let log
 * the user leaving.
 */
function confirmExit(){
  const eventType = {
    'type': 'User',
    'user': currentUser,
    'isActive': false,
  };
  bdk.createEvents(
    roomId,
    currentUser.name + ' has left the room at ' +
      moment().format('YYYY-MM-DD HH:mm Z'),
    eventType
  );
}

/**
 * To make participants sticky on the right hand side we edit the
 * document layout here.
 */
function createSidebar(){
  const participatElement =
    document.getElementById(botName)
      .parentElement.parentElement.parentElement;
  document.body.appendChild(
    document.getElementById(botName)
  );
  participatElement.remove();
  document.getElementById(botName).style.position = 'fixed';
  document.getElementById(botName).style.zIndex = 100;
  document.getElementById(botName).style.height = '100%';
  document.getElementById(botName).style.overflowX = 'hidden';
  document.getElementById(botName).style.right = 0;
  document.getElementById(botName).style.top = 0;
  document.getElementById(botName).style.width = '195px';
  document.getElementById(botName).style.backgroundColor = '#253045';
  document.body.style.marginRight = '198px';
}

/**
 * The actions to take before load.
 */
function init() {
  createSidebar();
  bdk.createEvents(
    roomId,
    currentUser.name + ' has joined the room at ' +
      moment().format('YYYY-MM-DD HH:mm Z'),
    {
      'type': 'User',
      'user': currentUser,
      'isActive': true,
    }
  )
    .then(() => {
      return bdk.findRoom(roomId);
    })
    .then((res) => {
      roles = (res.body.settings &&
        (res.body.settings.participantsRoles !== undefined)) ?
        res.body.settings.participantsRoles :
        [];
      return bdk.getBotData(roomId);
    })
    .then((data) => {
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

/**
 * This is the main function to render the UI
 *
 * {Integer} roomId - Room Id that is provided from refocus
 * @param {Object} _users - The current user on page
 */
function renderUI(_users, _roles, _currentRole, _currentUser){
  ReactDOM.render(
    <App
      roomId={ roomId }
      users={ _users }
      roles={ _roles }
      currentRole={ _currentRole }
      currentUser={ _currentUser }
    />,
    document.getElementById(botName)
  );
}

window.onbeforeunload = confirmExit;
document.getElementById(botName)
  .addEventListener('refocus.events', handleEvents, false);
document.getElementById(botName)
  .addEventListener('refocus.room.settings', handleSettings, false);
document.getElementById(botName)
  .addEventListener('refocus.bot.data', handleData, false);
document.getElementById(botName)
  .addEventListener('refocus.bot.actions', handleActions, false);

init();
