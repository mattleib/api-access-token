// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.
var Q = require('q');
var qs = require('querystring');
var user = require('./users')();
var uuid = require('./uuid');
var oidc_config = require('./oidc_configuration');
var appid = require('./appid');
var session = require('./session')();
var KJUR = require("../node_modules/jsrsasign/lib/jsrsasign.js"); 


function parseIdToken(idToken) {
   console.log("++oidc_protocol.js::parseIdToken");
   // Split the token into its parts. Parts are separated by a '.'.
   // Header.Payload.Signature
   var tokenParts = idToken.split('.');
   var header = tokenParts[0];
   var payload = tokenParts[1];
   // var signature = tokenParts[2];
   
   // The parts are base64-url-encoded, so decode it.
   var decodedHeader = new Buffer(header.replace("-", "+").replace("_", "/"), 'base64').toString('utf8');
   var decodedPayload = new Buffer(payload.replace("-", "+").replace("_", "/"), 'base64').toString('utf8');
   
   var decodedJsonToken = {
		'header' : JSON.parse(decodedHeader),
		'payload' : JSON.parse(decodedPayload),
   };
   
   return decodedJsonToken;
}

function findKey(kid) {
	var key = null;
	
	var keys = oidc_config.getKeys();
	for(var i=0; i < keys.keys.length; i++) {
		var currentKey = keys.keys[i];
		if(currentKey.kid === kid) {
			key = currentKey.x5c[0];
		}
	}
	
	// TODO: in case key is not found, re-fetch keys and try again
	// for now good enough...
	return key;
}

module.exports = function() {
	
	function authenticate(res, additionalScopes, preferred_username) {
		console.log('++oidc_protocol.js::authenticate');
		
		var stateUuid = uuid.generateUUID();
		
		var oidc = oidc_config.getOIDConfig();
		var params = {
			'client_id': appid.client_id,
			'redirect_uri': appid.redirect_uri,
			'scope': (additionalScopes ? 'openid ' + additionalScopes : 'openid'),
			'response_type': (additionalScopes ? 'code id_token' : 'id_token'),
			'response_mode': 'form_post',
			'state': stateUuid, // will be passed by redirect
			'nonce': stateUuid  // will be in the id_token
		};
		// TODO: Enable once login hint works
		//if(preferred_username){
		//	params.login_hint = preferred_username;
		//}
		var authorizeUri = oidc.authorization_endpoint + '?' + qs.stringify(params);
		
		//save state of the OIDC request
		var minute = 60 * 1000;
		res.cookie('oidcstate', stateUuid, { maxAge: minute * 5 } );

		res.writeHead(302, { 'Location': authorizeUri } );
		res.end();
	}
	
	function signout(req, res) {
		console.log('++oidc_protocol.js::signout');
		
		session.forgetme(req, res);
		var oidc = oidc_config.getOIDConfig();
		if(oidc.end_session_endpoint) {
			var params = {
				'post_logout_redirect_uri': appid.home
			};
			var signoutUri = oidc.end_session_endpoint + '?' + qs.stringify(params);	
			res.writeHead(302, { 'Location': signoutUri } );
			res.end();
		}
		else
		{
			res.writeHead(302, { 'Location': appid.home } );
			res.end();
		}
	}
	
	function verifyIDToken(idtoken, nonce) {
		console.log('++oidc_protocol.js::verifyIDToken');
		
		var err = { 'error': 'unknown' };
		var decodedIdToken = parseIdToken(idtoken);
		var oidc = oidc_config.getOIDConfig();
		
		//check nonce
		try {
			if(decodedIdToken.payload.nonce !== nonce) {
				console.log('-oidc error. incorrect nonce.');
				err = { 'error': 'invalid_nonce'};
			} else {
				// check issuer of the id token
				var issuer = oidc.issuer;
				var issuerTenantOIDConfig = issuer.replace(
					'{tenantid}',
					decodedIdToken.payload.tid
					);
				var startWithIssuerMatch = new RegExp('^' + decodedIdToken.payload.iss, 'i');
				if(!startWithIssuerMatch.test(issuerTenantOIDConfig)) {
					console.log('-oidc error. incorrect issuer.');
					err = { 'error': 'invalid_issuer'};				
				} else {
					// check if id token is for this app
					if(decodedIdToken.payload.aud !== appid.client_id) {
						console.log('-oidc error. incorrect audience.');
						err = { 'error': 'invalid_audience'};	
					} else {
						//Verify expiration
						var expires = decodedIdToken.payload.exp;
						var currentUnixTimeSecond = Math.floor((new Date).getTime()/1000);	
						var expired = expires - currentUnixTimeSecond;
						if(expired <= 0) {
							console.log('-oidc error. token expired.');
							err = { 'error': 'token_expired'};						
						}
						
						//find the key
						var key = findKey(decodedIdToken.header.kid);
						if(key === null) {
							console.log('-oidc error. no key found with kid::' + decodedIdToken.header.kid);
							err = { 'error': 'invalid_key'};	
						} else {
							// Verify Signature RS256 only supported right now.
							var cert_begin = "-----BEGIN CERTIFICATE-----\n";
							var end_cert = "-----END CERTIFICATE-----";
							var pemCert = cert_begin + key + end_cert;
							
							var isValid = KJUR.jws.JWS.verifyJWT(
								idtoken,
								pemCert,
								{alg: ["RS256"]});
			
							if(!Boolean(isValid)) {
								console.log('-oidc error. invalid signature');
								err = { 'error': 'invalid_signature'};
							} else {
								console.log('-oidc success. verified id token');
								err = { 'error': 'ok',
										'tokenpayload' : decodedIdToken.payload
								};
							}
						}
					}
				}
			}
		} catch(error) {
			console.log('-oidc catch error.');
			err = { 'error': 'unhandled_exception' };
		}
		
		return err;
	}

	function getIDTokenContent(idtoken) {
		return parseIdToken(idtoken);
	}
	
	function getOIDStateCookie(req) {
		return req.cookies.oidcstate;
	}
	
	function removeOIDStateCookie(res) {
		res.clearCookie('oidcstate');
	}
	
    return {
		'authenticate': authenticate,
		'signout': signout,
		'getOIDStateCookie': getOIDStateCookie,
		'removeOIDStateCookie': removeOIDStateCookie,
		'getIDTokenContent': getIDTokenContent,
		'verifyIDToken': verifyIDToken
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
