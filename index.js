'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    , noda = require('noda')

    /* in-package */
    , GerritAgent = noda.inRequire('class/GerritAgent')
    ;

function Rest(conn) {
    this.agent = new GerritAgent(conn);
}

Rest.prototype.classId = noda.inRequire('class.id');

Object.assign(Rest.prototype, {
    whoami           : require('./whoami'),
});

module.exports = Rest;