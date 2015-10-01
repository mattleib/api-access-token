// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var express = require('express');
var router = express.Router();

var session = require('../my_modules/session')();
var scopes = require('../my_modules/scopes');
var account = require('../my_modules/accounttype');
var appid = require('../my_modules/appid');

/* GET home page. */

router.get('/', function(req, res, next) {
  console.log('++route::index.js::GET');
    
  session.whoami(req).then( function(user) {
      var accountInfo = account.get(user);
      var consentPage = accountInfo.consentPage;
      var hasAuthorization = false
      if(user.refresh_token) {
        hasAuthorization = true;
      }   
      res.render('index', { title: appid.title, 
                        authenticated: true,
                        hasAuthorization: hasAuthorization,
                        userid: user.preferred_username,
                        consentPage: consentPage,
                        scopes: scopes });
  })
  .fail( function() {
        res.render('index', { title: appid.title, 
                        authenticated: false,
                        scopes: scopes });
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
