# Misaki 
##Node.js + Express + MongoDB web application 
###General
build on <a href='http://getbootstrap.com'>bootstrap</a> with love and care by <a href=http://twitter.com/zeratax>@zeratax</a>


this is very much a work in progress by an novice, 
but it's a fun project and I hope it'll become somewhat useful to you.

###Setting up
Just install the npm package or any equivalent on your system then using
your newly installed npm install the express framework:
```
npm install express --save
```

Then do the usual

```
npm install
npm start
```


###Tweaks
if you want to use the login by persona, you have to change

```javascript
const PORT = 8080;
const AUDIENCE = "http://localhost:" + PORT;
```

to your domain
