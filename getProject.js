'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, undertake = require('undertake')

	/* in-package */
	, Agent = require('./class/GerritAgent')
	;

/**
 * @param {Object} options.api
 * @param {string} options.name - name of project
 */
function getProject(options) {
	return undertake(function*() {
		let _agent = Agent.getOne(options);

		let encname = encodeURIComponent(options.name);

		// Basic info.
		var urlname = `/projects/${encname}`;
		let project = yield _agent.request('GET', urlname);
		if (!project) return null;

		// Description.
		var urlname = `/projects/${encname}/description`;
		let desc = yield _agent.request('GET', urlname);
		project.description = desc;

		// Branches.
		var urlname = `/projects/${encname}/branches`;
		let branches = yield _agent.request('GET', urlname);
		project.branches = branches;

		return project;
	});
}

module.exports = getProject;
