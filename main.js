let http = require('http');
let URL = require('url').URL;
let routes = require('./routes.js');
let fileServer = require('./fileserver.js');

function processRequest(request, response){
    let tmpURL = new URL('http://' + request.headers.host + request.url);
    
    let route = tmpURL.pathname.split('/').filter(x => x);
    
    if (!fileServer.handleFileRequest(request, response, tmpURL)){
        routes.processRoute(request, response, route);
    }
    
}

let httpServer = http.createServer(processRequest);
httpServer.listen(8080);
