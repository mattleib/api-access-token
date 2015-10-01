// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var mongoose = require('mongoose'); 
var Q = require('q'); 

module.exports = function() {
	
	function get_user(userid) {
		console.log('++users.js::get_user::' + userid);
		var deferred = Q.defer();
		mongoose.model('users').find({ uid: userid }, 
			function(err, user) {
				if(err) {
					console.log('-unable to retrieve user::' + err);
					deferred.reject();
				}
				else if(user.length === 0) {
					console.log('-user not found.');
					deferred.reject();
				}
				else if(user.length > 1) {
					console.log('-user not unique::' + user.length);
					deferred.reject();
				}
				else {		
					console.log('-user found.');
					deferred.resolve(user[0]);	
				}
			});
		return deferred.promise;
	}
	
	function new_user(userid, refreshtoken, name, username, tid) {
		console.log('++users.js::new_user');
		var deferred = Q.defer();
		get_user(userid).then(function(user) {
			
			console.log('-user already exists.');
			deferred.reject();
			
		}).fail(function() {
		
			mongoose.model('users').create({ 
				uid: userid,
				refresh_token: refreshtoken,
				name: name,
				preferred_username: username,
				tid: tid
				}, 
				function(err) {
					if(err) {
						console.log('-unable to create user::' + err);
						deferred.reject();
					} else {
						console.log('-user created.');
						deferred.resolve();	
					}
				});
		});
		return deferred.promise;
	}
	
	function update_user(userid, refreshtoken, name, username, tid, createIfNotExist) {
		console.log('++users.js::update_user');
		var deferred = Q.defer();
		get_user(userid).then(function(user) {		
			var updateData = { 
				name: name,
				preferred_name: username,
				tid: tid
			};	
			if(refreshtoken) {
				updateData.refresh_token = refreshtoken;
			}
			
			user.update(updateData, 
				function(err) {
					if(err) {
						console.log('-unable to update user::'+err);
						deferred.reject();
					} else {
						console.log('-user updated.');
						deferred.resolve();
					}
				});
			
		}).fail(function() {
		
			console.log('-user does not exist.');
			if(Boolean(createIfNotExist)) {
				new_user(userid, refreshtoken, name, username, tid).then(
					function() { deferred.resolve(); }
				).fail(
					function() { deferred.reject(); }
				);
			} else {
				deferred.reject();
			}
			
		});
		return deferred.promise;
	}
	
	function delete_user(userid) {
		console.log('++users.js::delete_user');
		var deferred = Q.defer();
		get_user(userid).then(function(user) {
			
			user.remove(
				function(err) {
					if(err) {
						console.log('-unable to delete user::'+err);
						deferred.reject();
					} else {
						console.log('-user deleted.');
						deferred.resolve();
					}
				});
			
		}).fail(function() {
			console.log('-user does not exist.');
			deferred.reject();
		});
		return deferred.promise;
	}	

   return {
	'get_user': get_user,
	'new_user': new_user,
	'update_user': update_user,
	'delete_user': delete_user,
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
