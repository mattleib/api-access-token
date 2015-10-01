// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var express = require('express');
var request = require('request');
var querystring = require('querystring');
var Q = require('q'); 
var session = require('./session')();
var oidc_config = require('./oidc_configuration');
var appid = require('./appid');

function getOAuth2RequestPostData(grant_type, grant_value) {
	
	var post_data = {};
	
	if(grant_type === 'code') {
		post_data = querystring.stringify({
			'grant_type' : 'authorization_code',
			'code': grant_value,
			'client_id': appid.client_id,
			'client_secret' : appid.client_secret,
			'redirect_uri' : appid.redirect_uri
		});
	}
	
	if(grant_type === 'refresh_token') {
		post_data = querystring.stringify({
			'grant_type' : 'refresh_token',
			'refresh_token': grant_value,
			'client_id': appid.client_id,
			'client_secret' : appid.client_secret,
			'redirect_uri' : appid.redirect_uri
		});
	}
	
	return post_data;	
}

function oauth2PostRequest(form_post_data) {
	
	var oidc = oidc_config.getOIDConfig();
	
	var options = { 
		uri: oidc.token_endpoint, 
		method: 'POST',
		form: form_post_data};
		
	var deferred = Q.defer();
	request(options, function(error, response, body) {
		if (!error) {
			deferred.resolve(JSON.parse(body));
		} else {
			deferred.reject(JSON.parse(error));
		}
	});
	
	return deferred.promise;
}

module.exports = function () {

	function getAccessTokenByCode(code) {
		console.log('++oauth2_protocol.js::getAccessTokenByCode');		
		var deferred = Q.defer();
		var postData = getOAuth2RequestPostData('code', code);
		oauth2PostRequest(postData).then(function(body) {
			console.log('-success');
			deferred.resolve(body);
		}).fail(function(error) {
			console.log('-error');
			deferred.reject(error);
		});
		return deferred.promise;
	}

	function getAccessTokenByRefreshToken(refresh_token) {		
		console.log('++oauth2_protocol.js::getAccessTokenByRefreshToken');		
		var deferred = Q.defer();
		var postData = getOAuth2RequestPostData('refresh_token', refresh_token);
		oauth2PostRequest(postData).then(function(body) {
			console.log('-success');
			deferred.resolve(body);
		}).fail(function(error) {
			console.log('-error');
			deferred.reject(error);
		});
		return deferred.promise;
	}
	
	return {
		'getAccessTokenByCode': getAccessTokenByCode,
		'getAccessTokenByRefreshToken': getAccessTokenByRefreshToken
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
