let fs = require('fs').promises;
let mongoClient = require('mongodb').MongoClient;

async function get(request, response){
    try{
        let template = await fs.readFile('./templates/createprofile.html',  {encoding: 'utf8'});
        response.writeHead(200, {'Content-Type':'text/html'});
        response.end(template);
    }
    catch(e){
        console.log(e.message);
        response.writeHead(500, {'Content-Type':'text/plain'});
        response.end('Error 500 - blargh');
    }
    finally{
        
    }
}



function post(request, response){
    let data = '';
    
    request.on('data', function(chunk){
        data += chunk;
    });
    
    request.on('end', async function(){
        let dbconn;
        try{
            let searchParams = new URLSearchParams(data);
            if (searchParams.has('name') && searchParams.has('description') && searchParams.has('profilepicture')){                
                dbconn = await mongoClient.connect('mongodb://127.0.0.1:27017');
                let dbo = dbconn.db('sy20_test');
                
                let dataobj = {
                    name: searchParams.get('name'),
                    description: searchParams.get('description'),
                    profilePicture: searchParams.get('profilepicture'),
                    galleryImages: []
                };
                
                await dbo.collection('profiles').insertOne(dataobj);
                response.writeHead(303, {'Location': '/profile?profileid=' + dataobj.name});
                response.end();
            }
            else{
                response.writeHead(422, {'Content-Type':'text/plain'});
                response.end('Error - All fields was not provided');
            }            
        }
        catch(e){
            console.log(e.message);
            response.writeHead(500, {'Content-Type':'text/plain'});
            response.end('Error 500 - blargh');
        }
        finally{
            dbconn.close();
        }
    });
    
    
    
    
}


exports.processRoute = function(request, response, route){
    if (request.method === 'POST'){
        post(request, response);
    }
    else{
        get(request, response);
    }
};