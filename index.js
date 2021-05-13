const express = require('express')
const hostname = "0.0.0.0"
const PORT = 4000;
const fs = require('fs')
const path = require('path')
const admzip = require('adm-zip')

const multer = require('multer');
const { static } = require('express');
const { send } = require('process');

const app = express()

app.use(express.static('public'))

var dir = "public"
var subDirectory = "public/uploads"
var uploadDir = fs.readdirSync(__dirname+"/Upload_img");

app.get('/imagezipfile', (req, res) => {
 
    const zip = new admzip();
 
    for(var i = 0; i < uploadDir.length;i++){
        zip.addLocalFile(__dirname+"/Upload_img/"+uploadDir[i]);
    }
 
    // Define zip file name
    const downloadName = `imagedwonlaodfile.zip`;
 
    const data = zip.toBuffer();
 
    // save file zip in root directory
    zip.writeZip(__dirname+"/"+downloadName);
    
    // code to download zip file
 
    res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${downloadName}`);
    res.set('Content-Length',data.length);
    res.send(data);
 
})



if(!fs.existsSync(dir)){
    fs.mkdirSync(dir)

    fs.mkdirSync(subDirectory)
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

var maxSize = 10 * 1024 * 1024;

var compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});


app.post("/compressfiles", compressfilesupload.array("file", 100), (req, res) => {

    var zip = new admzip();
    var outputFilePath = Date.now() + "output.zip";
     if (req.files) {
        
      req.files.forEach((file) => {
        
        console.log(file.path)
        zip.addLocalFile(file.path)
      });
      
       fs.writeFileSync(outputFilePath, zip.toBuffer());
       res.download(outputFilePath,(err) => {
       if(err){
          req.files.forEach((file) => {
             fs.unlinkSync(file.path)
           });
           fs.unlinkSync(outputFilePath) 
           res.send("Error while downloading zip file.") 

        }
  
        //  req.files.forEach((file) => {
        //  fs.unlinkSync(file.path)
        //  });
  
        //  fs.unlinkSync(outputFilePath)
     })
    }
  });
  

app.listen(PORT, hostname, () => {
  console.log(`App is listening on http://${hostname}:${PORT}/`);
});