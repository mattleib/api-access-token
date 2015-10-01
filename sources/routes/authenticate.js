// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var express = require('express');
var session = require('../my_modules/session')();
var oidc = require('../my_modules/oidc_protocol')();
var oauth2 = require('../my_modules/oauth2_protocol')();
var users = require('../my_modules/users')();
var scopes = require('../my_modules/scopes');
var account = require('../my_modules/accounttype');
var appid = require('../my_modules/appid');
var router = express.Router();

/* render results */
function renderAuthResult(req, res, result, userid) {
    users.get_user(userid)
    .then( function(user) {
      var accountInfo = account.get(user);
      var consentPage = accountInfo.consentPage;
      var hasAuthorization = false;
      if(user.refresh_token) {
        hasAuthorization = true;
      }    
      res.render('index', { 
                    title: appid.title, 
                    authenticated: true,
                    hasAuthorization: hasAuthorization,
                    userid: user.preferred_username,
                    consentPage: consentPage,
                    scopes: scopes,
                    result: result});
      res.end();
    })
    .fail( function() {
      res.render('index', { 
              title: appid.title, 
              authenticated: false,
              scopes: scopes,
              result: result});
      res.end();
    });
}

function authentication_complete(req, res, resultString, 
  expires, uid, refresh_token, name, preferred_username, tid) {
  
  session.rememberme(res, expires, uid, refresh_token, name, preferred_username, tid)
  .then(function() {
      oidc.removeOIDStateCookie(res);
      renderAuthResult(req, res, resultString, uid);    
  })
  .fail(function() {    
      oidc.removeOIDStateCookie(res);
      renderAuthResult(req, res, 'Session error: ' + resultString, uid);    
  });
}

/* Authenticate the request using OpenID connect. */
router.get('/', function(req, res, next) {
  console.log('++route::authenticate.js::GET');
  
  // get not supported most likely error in fragment
  renderAuthResult(req, res, "Unsupported auth request or auth error. Check URL.")
});

router.post('/', function(req, res, next) {
  console.log('++route::authenticate.js::POST');

  if(req.body.error) {
    console.log('-oidc error::'+req.body.error+'::'+req.body.error_description);
    renderAuthResult(req, res, JSON.stringify(req.body.error, null, 2));
    return;
  } 
  
  // process an received id_token
  console.log('-oidc got id_token');
  var id_token = req.body.id_token;
  var expires = req.body.id_token_expires_in;
  var state = req.body.state;
  var stateCookie = oidc.getOIDStateCookie(req);
    
  if(stateCookie !== state) {
    console.log('-oidc state error');
    renderAuthResult(req, res, 'Error: OIDC state mismatch.');
    return;
  } 
  
  //validate OIDC id_token
  var result = oidc.verifyIDToken(id_token, state);
  if(result.error !== 'ok') {
    console.log('-oidc validation error');
    renderAuthResult(req, res, JSON.stringify(result, null, 2));
    return;        
  } 
 
  // valid id_token     
  var token = result.tokenpayload;
  var sub = token.sub;
  var tid = token.tid;
  var name = token.name;
  var preferred_username = token.preferred_username;
  
  // process a received code and exchange with refresh / access token
  if(req.body.code) {
    console.log('-code received');
    oauth2.getAccessTokenByCode(req.body.code)
    .then(function(oauth2Response){
      authentication_complete(req, res, JSON.stringify(oauth2Response, null, 2), expires, sub, oauth2Response.refresh_token, name, preferred_username, tid);
    }).
    fail(function(error){
      authentication_complete(req, res, JSON.stringify(error, null, 2), expires, sub, '', name, preferred_username, tid);
    });
  } else {
    // only id token flow (signon)
    authentication_complete(req, res, JSON.stringify(req.body, null, 2), expires, sub, '', name, preferred_username, tid);
  }
  
});

module.exports = router;

/*
  MIT License: 
  Permission is hereby granted, free of charge, to any person obtaining 
  a copy of this software and associated documentation files (the 
  ""Software""), to deal in the Software without restriction, including 
  without limitation the rights to use, copy, modify, merge, publish, 
  distribute, sublicense, and/or sell copies of the Software, and to 
  permit persons to whom the Software is furnished to do so, subject to 
  the following conditions: 
  The above copyright notice and this permission notice shall be 
  included in all copies or substantial portions of the Software. 
  THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND, 
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
