let gallery = require('./routes/gallery.js');
let guestbook = require('./routes/guestbook.js');
let profile = require('./routes/profile.js');
let createProfile = require('./routes/createprofile.js');

exports.processRoute = function(request, response, route){
    if (route.length === 0){
        gallery.processRoute(request, response, route);
    }
    else{
        let stage = route.shift();
        
        if (stage === 'guestbook'){
            guestbook.processRoute(request, response, route);
        }
        else if (stage === 'createprofile'){
            createProfile.processRoute(request, response, route);
        }
        else if (stage === 'profile'){
            profile.processRoute(request, response, route);
        }
        else{
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end('Error 404 - Not found! (You suck)');
        }
    }
};