/**
 * config.js
 * Config file for different deployments - dev, staging, production
 */

module.exports = {
  dev: {
    refocusUrl: 'http://localhost:3000',
    host: 'localhost',
    port: '3000',
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
  staging: {
    refocusUrl: 'http://refocus-staging.herokuapp.com',
    host: 'refocus-staging.herokuapp.com',
    port: '',
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
  sandbox: {
    refocusUrl: 'https://refocus-sandbox.hk.salesforce.com',
    host: 'refocus-sandbox.hk.salesforce.com',
    port: '',
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
  production: {
    refocusUrl: 'https://refocus.hk.salesforce.com',
    host: 'refocus.hk.salesforce.com',
    port: '',
    token: process.env.API_TOKEN,
    socketToken: process.env.SOCKET_TOKEN,
  },
};
