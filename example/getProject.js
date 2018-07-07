'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')
    
    /* in-package */
    , getProject = noda.inRequire('getProject')
    , conn = noda.inRequire('conn')
    ;

getProject({ conn, name: 'Framework/Presentation/Lizard' })
.then(meta => {
    console.log('-- SUCCESS --');
    console.log(meta);
}).catch(err => {
    console.log('-- ERROR --');
    console.log(err);
});
