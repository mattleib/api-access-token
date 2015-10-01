// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.

function popup(pageURL, title, width, height, options) {
    return window.open(pageURL, title,
        'width=' + (width || options.width || '') + ',' +
        'height=' + (height || options.height || '') + ',' +
        'left=' + (options.left || '') + ',' +
        'top=' + (options.top || '') + ',' +
        'toolbar=' + (options.toolbar || 'no') + ',' +
        'location=' + (options.location || 'no') + ',' +
        'directories=' + (options.directories || 'no') + ',' +
        'status=' + (options.status || 'no') + ',' +
        'menubar=' + (options.menubar || 'no') + ',' +
        'scrollbars=' + (options.scrollbars || 'no') + ',' +
        'resizable=' + (options.resizable || 'no') + ',' +
        'copyhistory=' + (options.copyhistory || 'no') + ','
    );
}

function popupCenter(pageURL, title, width, height, options) {
    options = options || {};
    width = (width | screen.width / 3);
    height = (height | screen.height / 3);
    options.left = (screen.width / 2) - (width / 2);
    options.top = (screen.height / 2) - (height / 2);

    return popup(pageURL, title, width, height, options);
}

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