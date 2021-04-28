/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * ./index.js
 *
 * This code handles will listen to refocus and handle any activity
 * that requires the bot server attention.
 */
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const env = require('./config.js').env;
const PORT = require('./config.js').port;
const config = require('./config.js')[env];
const packageJSON = require('./package.json');
const bdk = require('@salesforce/refocus-bdk')(config);

// Installs / Updates the Bot
bdk.installOrUpdateBot(packageJSON);

http.Server(app).listen(PORT, () => {
  bdk.log.info('listening on: ', PORT);
});
