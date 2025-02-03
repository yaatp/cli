const cucumber = require('@cucumber/cucumber');
const { Override } = require('./lib/Override');
const { Fixture } = require('./lib/Fixture');
const { Template } = require('./lib/Template');

module.exports = {
    ...cucumber,
    Override,
    Fixture,
    Template
}