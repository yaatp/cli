const cucumber = require('@cucumber/cucumber');
const { Override } = require('./lib/Override');
const { Fixture } = require('./lib/Fixture');

module.exports = {
    ...cucumber,
    Override,
    Fixture
}