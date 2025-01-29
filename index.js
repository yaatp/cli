const cucumber = require('@cucumber/cucumber');
const { Override } = require('./lib/Override');

module.exports = {
    ...cucumber,
    Override
}