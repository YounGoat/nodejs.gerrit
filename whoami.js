'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */

	/* in-package */
	, Agent = require('./class/GerritAgent')
	;

/**
 * 
 * @param {Object}  options 
 * @param {Object} [options.api] 
 */
function whoami(options) {
	let _agent = Agent.getOne(options);
	let urlname = '/a/accounts/self';
    return _agent.request('GET', urlname);
}

module.exports = whoami;
