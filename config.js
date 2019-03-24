/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint no-process-env: 0 */

/**
 * config.js
 * Config file for different deployments - dev, staging, production
 */

const DEFAULT_PORT = 5000;

module.exports = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || DEFAULT_PORT,
  dev: {
    refocusUrl: process.env.REFOCUS_URL ||
      'http://localhost:3000',
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
  perf: {
    refocusUrl: process.env.REFOCUS_URL,
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
  sandbox: {
    refocusUrl: process.env.REFOCUS_URL ||
      'https://refocus-sandbox.hk.salesforce.com',
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
  production: {
    refocusUrl: process.env.REFOCUS_URL ||
      'https://refocus.hk.salesforce.com',
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
};
