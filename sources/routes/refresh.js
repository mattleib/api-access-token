// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var express = require('express');
var router = express.Router();
var querystring = require('querystring');
var moment = require('moment');
var session = require('../my_modules/session')();
var oauth2 = require('../my_modules/oauth2_protocol')();
var account = require('../my_modules/accounttype');
var scopes = require('../my_modules/scopes');
var appid = require('../my_modules/appid');
  
/* Sign-On the user */
router.get('/', function(req, res, next) {
  console.log('++route::refresh.js::GET');
            
  session.whoami(req).then( function(user) {
      if(!user.refresh_token) {
        console.log('-error: no refresh token');
        res.writeHead(302, { 'Location': appid.home });
        res.end();
      }
      var accountInfo = account.get(user);
      var consentPage = accountInfo.consentPage;
      var hasAuthorization = true; 
      oauth2.getAccessTokenByRefreshToken(user.refresh_token)
      .then(function(oauth2Response){
            var expirationDate = moment().add(oauth2Response.expires_in, 'seconds').format('LLL');            
            res.render('index', { 
                    title: appid.title, 
                    authenticated: true,
                    hasAuthorization: hasAuthorization,
                    userid: user.preferred_username,
                    consentPage: consentPage,
                    scopes: scopes,
                    result: JSON.stringify(oauth2Response, null, 2),
                    accessToken: (req.query.display ? oauth2Response.access_token : null),
                    expiration: (req.query.display ? expirationDate : null),
                    consentedScopes : oauth2Response.scope
                    });
           res.end();
      })
      .fail(function(error){
          res.render('index', { 
                  title: appid.title, 
                  authenticated: false,
                  scopes: scopes,
                  result: error});
          res.end(); 
      });
  })
  .fail( function() {
        res.writeHead(302, { 'Location': appid.home });
        res.end();
  });
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
