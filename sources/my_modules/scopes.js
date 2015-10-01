// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.

// key value pair of scopes
var scopes = [];

//scopes.push({ name: 'Offline access', scope:'offline_access' });
scopes.push({ name:	'Read your mail', scope:'https://outlook.office.com/mail.read' });
scopes.push({ name:	'Full access to your mail', scope:'https://outlook.office.com/mail.readwrite' });
scopes.push({ name:	'Send mail', scope:'https://outlook.office.com/mail.send' });
scopes.push({ name:	'Read your calendars', scope:'https://outlook.office.com/calendars.read' });
scopes.push({ name:	'Full access to your calendars', scope:'https://outlook.office.com/calendars.readwrite' });
scopes.push({ name:	'Read your contacts', scope:'https://outlook.office.com/contacts.read' });
scopes.push({ name:	'Full access to your contacts', scope:'https://outlook.office.com/contacts.readwrite' });

module.exports = scopes;

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
