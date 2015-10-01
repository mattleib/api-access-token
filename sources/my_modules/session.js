// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var Q = require('q');
var user = require('./users.js')();

module.exports = function() {
	
	function authenticated(req) {
		console.log('++session.js::authenticate');		
		if(req.cookies.rememberme) {
			return true;
		}
		return false;
	}
	
	function forgetme(req, res) {
		console.log('++session.js::forgetme');
		if(!authenticated(req)) {
			return null;
		}
		res.clearCookie('rememberme');
	}
		
	function rememberme(res, lifetime, userid, refreshtoken, name, preferred_username, tid) {
		console.log('++session.js::rememberme::'+preferred_username);
		var deferred = Q.defer();
		user.update_user(userid, refreshtoken, name, preferred_username, tid, true).then(
			function() {  
				var minute = 60 * 1000; // TODO: replace with better lifetime later, e.g. from id_token
				res.cookie('rememberme', userid, { maxAge: minute * 60 } );
				deferred.resolve(); 
			}
		).fail(
			function() {  deferred.reject(); }
		)
		
		return deferred.promise;
	}
	
	function whoami(req) {
		console.log('++session.js::whoami');
		var deferred = Q.defer();
		
		if(!authenticated(req)) {
			deferred.reject();
			return deferred.promise;
		}
		
		var userid = req.cookies.rememberme;
		
		user.get_user(userid).then(
			function(user) {  deferred.resolve(user); }
		)
		.fail(
			function() { deferred.reject(); }
		);
		
		return deferred.promise;
	}

   return {
	'authenticated': authenticated,
	'forgetme': forgetme,
	'rememberme': rememberme,
	'whoami': whoami
   }
};

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
