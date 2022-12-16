let fs = require('fs').promises;
let URL = require('url').URL;
let mongoClient = require('mongodb').MongoClient;

exports.processRoute = async function(request, response, route){        
        let dbConnection;
        try{
            dbConnection = await mongoClient.connect('mongodb://127.0.0.1:27017');
            let dbo = dbConnection.db('sy20_test');
            let tmpURL = new URL('http://' + request.headers.host + request.url);
            
            if (tmpURL.searchParams.has('profileid')){ // Display a single profile    
                
                let profileTemplate = await fs.readFile('./templates/profile.html', {encoding: 'utf8'});
                let dbres = await dbo.collection('profiles').findOne({ name: tmpURL.searchParams.get('profileid')});
                
                if (dbres){
                    profileTemplate = profileTemplate.replace('{{name}}', dbres.name);
                    profileTemplate = profileTemplate.replace('{{profile-picture}}', dbres.profilePicture);
                    profileTemplate = profileTemplate.replace('{{description}}', dbres.description);
                    
                    let imgGallery = '';
                    for (let i=0; i<dbres.galleryImages.length; i++){
                        imgGallery += '<img src="';
                        imgGallery += dbres.galleryImages[i].imageSource;
                        imgGallery += '" alt="';
                        imgGallery += dbres.galleryImages[i].description;
                        imgGallery += '">';
                    }
                    profileTemplate = profileTemplate.replace('{{gallery-images}}', imgGallery);

                    response.writeHead(200, {'Content-Type':'text/html'});
                    response.end(profileTemplate);
                }
                else{
                    response.writeHead(404, {'Content-Type':'text/plain'});
                    response.end('Could not find profile');
                }
            }
            else{  // Display profile index     
                
                let profilelistTemplate = await fs.readFile('./templates/profilelist.html', {encoding: 'utf8'});
                let profilelistitemTemplate = await fs.readFile('./templates/profilelistitem.html',{encoding: 'utf8'});
                let dbres = await dbo.collection('profiles').find({}).project({name:1, _id:0}).toArray();
                
                let profilelist = '';
                for (let i=0; i<dbres.length; i++){
                    profilelist += profilelistitemTemplate.replaceAll('{{profileid}}', dbres[i].name);
                }
                profilelistTemplate = profilelistTemplate.replace('{{profilelistitems}}', profilelist);
                
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(profilelistTemplate);
                
            }
        }
        catch (e){
            console.log(e.message);
            response.writeHead(500, {'Content-Type':'text/plain'});
            response.end('Error 500 - Internal server error');
        }
        finally{
            dbConnection.close();
        }
};