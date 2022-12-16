let fs = require('fs').promises;
let mongoClient = require('mongodb').MongoClient;

let dbconn;

async function get(request, response){
    try{
        let baseTemplate = await fs.readFile('./templates/guestbookbase.html', {encoding: 'utf8'});
        let guestbookBodyTemplate = await fs.readFile('./templates/guestbookbody.html', {encoding: 'utf8'});
        let guestbookPostTemplate = await fs.readFile('./templates/guestbookpost.html', {encoding: 'utf8'});
        dbconn = await mongoClient.connect('mongodb://127.0.0.1:27017');
        let dbo = dbconn.db('sy20_test');
        let dbres = await dbo.collection('guestbookposts').find({}).toArray();

        baseTemplate = baseTemplate.replace('{{title}}', 'Guestbook');
        baseTemplate = baseTemplate.replace('{{body}}', guestbookBodyTemplate);
        let bodyContent = '';
        for (let i=0; i<dbres.length; i++){
            let tmpStr = guestbookPostTemplate.replace('{{message}}', dbres[i].message);
            tmpStr = tmpStr.replace('{{author}}', dbres[i].name);
            bodyContent += tmpStr;
        }
        baseTemplate = baseTemplate.replace('{{guestbookposts}}', bodyContent);
        baseTemplate = baseTemplate.replace('{{css}}', 'water');
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.end(baseTemplate);
    }
    catch(e){
        console.log(e.message);
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end('Error 500 - Internal server error');
    }
    finally{
        dbconn.close();
    }
}

async function post(request, response){
    let postdata = '';     
        
    request.on('data', function(chunk){
       postdata += chunk; 
    });

    request.on('end', async function(){
        let searchParams = new URLSearchParams(postdata);

        if (searchParams.has('name') && searchParams.has('message')){
            try{                                   
                dbconn = await mongoClient.connect('mongodb://127.0.0.1:27017');
                let dbo = dbconn.db('sy20_test');

                let dbpost = {
                    name: searchParams.get('name'),
                    message: searchParams.get('message')
                };

                await dbo.collection('guestbookposts').insertOne(dbpost);
                response.writeHead(303, {'Location': '/guestbook'});
                response.end();
            }
            catch(e){
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end('Error 500 - Internal server error');
            }
            finally{
                dbconn.close();
            }
        }
        else{
            response.writeHead(422, {'Content-Type':'text/plain'});
            response.end('Error - All fields was not provided');
        }
    });
}

exports.processRoute = function (request, response, route){    
    if (request.method === 'POST'){
        post(request, response);        
    }
    else{                        
        get(request, response);
    }
};