/**
 * REFERENCE:
 *   Digest access authentication
 *   https://en.wikipedia.org/wiki/Digest_access_authentication
 */

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, htp = require('htp')
	, noda = require('noda')
	, parseOptions = require('jinang/parseOptions')
	, undertake = require('undertake')
	
	/* in-package */

	/* in-file */

	// Create MD5 digest.
	, md5 = content => require('crypto').createHash('md5').update(content).digest('hex')
	, md5c = function() { return md5(Array.from(arguments).join(':')); }

	// Util to deal with digest field.
	, digest = {
		// Parse `Digest name="value", ...` to an object.
		parse: auth => {
			let info = null;
			let head = 'Digest ';
			if (auth.startsWith(head)) {
				let re = /\s*([^=]+)="([^"]+)"(,|$)/y;
				re.lastIndex = head.length;
				info = {};
				while (re.test(auth)) {
					info[RegExp.$1] = RegExp.$2;
				}
			}
			return info;
		},

		// Stringify an object to `Digest name="value", ...` string.
		stringify: info => {
			let parts = [];
			for (let key in info) {
				if (info[key]) parts.push(`${key}="${info[key]}"`);
			}
			return `Digest ${parts.join(', ')}`;
		},
	}
	;

/**
 * To prevent against Cross Site Script Inclusion (XSSI) attacks, the JSON response body starts with a magic
 * prefix line that must be stripped before feeding the rest of the response body to a JSON parser:
 */
const MAGIC_PREFIX = ")]}'";

class GerritAgent {

	/**
	 * 
	 * @param {string} api.endpoint
	 * @param {string} api.username
	 * @param {string} api.password
	 */
	constructor(api) {
		this.endpoint = api.endpoint;
		this.username = api.username;
		this.password = api.password;

		/* Nonce Count */
		this.nc = 0;

		/* Client Nonce */
		this.cnonce = '1234';

		this.www_authenticate = null;
	}

	createDigest(method, uri, body) {
		this.nc++;

		let { username, password, nc, cnonce } = this;
		let { realm, nonce, qop, opaque } = this.www_authenticate;

		let HA1 = md5c(username, realm, password);

		let HA2;
		if (qop == 'auth-init') {
			HA2 = md5c(method, uri, md5(body));
		}
		else if (qop == 'auth' || !qop) {
			HA2 = md5c(method, uri);
		}

		let response;
		if (qop == 'auth-init' || qop == 'auth') {
			response = md5c(HA1, nonce, nc, cnonce, qop, HA2);
		}
		else {
			response = md5c(HA1, nonce, HA2);
		}

		return digest.stringify({
			username,
			realm,
			nonce,
			uri,
			qop,
			nc,
			cnonce,
			response,
			opaque,
		});
	}

	request(method, uri, headers, body) {
		let that = this;
		return undertake(function*() {
			if (!headers) headers = {};
			if (that.www_authenticate) {
				headers.Authorization = that.createDigest(method, uri, body);
			}
			let urlname = that.endpoint + '/a' + uri;
			let args = [ method, urlname, headers ];
			if (body) args.push(body);

			// First request.
			let res = yield htp.apply(null, args);

			if (res.statusCode == 401) {
				that.nc = 0;
				that.www_authenticate = digest.parse(res.headers['www-authenticate']);
				headers.Authorization = that.createDigest(method, uri, body);
				// Second request.
				res = yield htp.apply(null, args);
			}

			if (res.statusCode == 404) {
				return null;
			}
			
			if (res.statusCode != 200) {
				throw new Error(`${res.statusCode} on ${method} ${uri}`);
			}

			if (!res.body.startsWith(MAGIC_PREFIX)) {
				throw new Error(`magic prefix not found: ${res.body.slice(0, 100)}`);
			}

			let json;
			try {
				json = JSON.parse(res.body.slice(MAGIC_PREFIX.length));
			} catch(ex) {
				throw new Error(`invalid response: ${res.body.slice(0, 100)}`);
			}

			return json;
		});
	}
}

const _instances = {};
GerritAgent.getOne = function(options) {
	if (this && this.__proto__.classId == noda.inRequire('class.id')) {
		return this.agent;
	}
	
	const po = parseOptions(options.conn ? options.conn : options, {
		explicit: true,
		caseSensitive: false,
		keepNameCase: false,
		columns: [
			'endpoint alias(end_point)',
			'username',
			'password',
		],
	});

	// Trim the tailing slash in endpoint.
	if (po.endpoint) {
		po.endpoint = po.endpoint.replace(/\/$/, '');
	}

	let digest = md5(JSON.stringify(po));
	let agent = _instances[digest];
	if (!agent) {
		agent = new GerritAgent(po);
		_instances[digest] = agent;
	}
	return agent;
};

module.exports = GerritAgent;