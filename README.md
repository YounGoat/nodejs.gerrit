#	gerrit
__Gerrit API based on offical REST API__

>	If links in this document not avaiable, please access [README on GitHub](./README.md) directly.

##  Description

Gerrit API based on official REST API.

##  Table of Contents

* [Links](#links)
* [Get Started](#get-started)
	* [Class](#class)
	* [Standalone Function](#standalone-function)
* [API](#api)
* [Examples](#examples)

##	Links

*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/nodejs.gerrit)

##	Get Started

###	Class

```javascript
const Rest = require('gerrit');
const apiconn = {
    username: 'http-username',
    password: 'http-password',
    endpoint: 'http://gerrit.example.com',
}

const rest = new Rest(apiconn);
rest.whoami().then(data => {
    // ...
}).catch(ex => {
    // ...
});
```

###	Standalone Function

```javascript
const whoami = require('gerrit/whoami');
const apiconn = {
    username: 'http-username',
    password: 'http-password',
    endpoint: 'http://gerrit.example.com',
};

whoami(apiconn).then(data => {
    // ...
}).catch(ex => {
    // ...
});
```
##	API

*	Class __Rest__({ string *username*, string *password*, string *endpoint* })
*	Promise(Object) __\<rest\>.whoami__()
*	Promise(Object) __\<rest\>.getProject__({ string *name* })

All methods are asynchronous and will return instances of `Promise`. Hereafter, *response* means what to be obtained in `.then((response) => { /* ... */ })`.

All methods may be required and invoked by itself as what we see in [Get Started, Standalone Function](#standalone-function).

##  Examples

Before execute the examples, please replace the `conn` parameters according to your own account.

*	[getProject](./example/getProject.js)
*	[whoami](./example/whoami.js)