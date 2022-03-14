'use strict';
const app = require('./src/index/start')
const serverless = require('serverless-http')
module.exports.hello = serverless(app)