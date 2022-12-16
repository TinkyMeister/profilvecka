let fs = require('fs');
let mongoClient = require('mongodb').MongoClient;

exports.processRoute = function (request, response, route){
    if (route.length === 0){
        fs.readFile('./templates/base.html', function(error, data){
            if (!error){
                let baseTemplate = data.toString();
                
                fs.readFile('./templates/gallerypost.html', function(error, data){
                    if (!error){
                        let gbpTemplate = data.toString();
                        
                        mongoClient.connect('mongodb://127.0.0.1:27017', function(error, db){
                            if (!error){
                                dbo = db.db('sy20_test');

                                dbo.collection('galleryposts').find({}).toArray(function(error, result){
                                    if (!error){
                                        baseTemplate = baseTemplate.replace('{{title}}', 'Gallery');
                
                                        let bodyContent = '';

                                        for (let i=0; i<result.length; i++){
                                            let tmpStr = gbpTemplate.replace('{{imgsrc}}', result[i].imagesrc);
                                            tmpStr = tmpStr.replace('{{imgalt}}', result[i].imagedesc);
                                            tmpStr = tmpStr.replace('{{imgdesc}}', result[i].imagedesc);
                                            bodyContent += tmpStr;
                                        }

                                        baseTemplate = baseTemplate.replace('{{body}}', bodyContent);

                                        baseTemplate = baseTemplate.replace('{{css}}', 'gallery');

                                        response.writeHead(200, {'Content-Type' : 'text/html'});
                                        response.end(baseTemplate);
                                    } 
                                    else{
                                        response.writeHead(500, {'Content-Type': 'text/plain'});
                                        response.end('Error 500 - Internal server error');
                                    }
                                });
                            } 
                            else{
                                 response.writeHead(500, {'Content-Type': 'text/plain'});
                                 response.end('Error 500 - Internal server error');
                            }
                        });                                                
                    }
                    else{
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.end('Error 500 - Internal server error');
                    }
                });
            }
            else{
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end('Error 500 - Internal server error');
            }
        });        
    }
    else{
        let stage = route.shift();
        if (stage === 'landscapes'){            
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('Here you find the most beautiful landscapes in the world!');
        }
        else if (stage === 'mines'){
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('Here there be monsters');
        }
        else{
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end('Error 404 - These are not the galleries you are looking for');
        }
    }
};