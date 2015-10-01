# api-access-token
Sign-On with an MSA or Work account and get access tokens for Microsoft Office APIs

This app is developed using Node.JS/Express/MongoDB.

To run it you must first register your app at https://apps.dev.microsoft.com

There, add web as a platform and get your own client_id, client_secret and redirect_uri.

Configure all this in "./my_modules/appid.js" in the project.

Make sure app runs on the right port as specified in "./bin/www" in the project.

Create SSL keys for your http service using openSSL and specify in "./bin/www".

Good luck!

App is currecntly hosted on https://cid.leibmann.com:8080/






