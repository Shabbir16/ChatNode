var Express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = Express();
var fs = require('fs');
let http = require('http').Server(app);
let io = require('socket.io')(http);

// const app = express();

app.use(bodyParser.json());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var Storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, "./Images");
    },
    filename: function(req, file, callback) {
        callback(null,  file.originalname);
    }
});

var upload = multer({
    storage: Storage
}).array("demo[]", 3); //Field name and max count

app.post("/api/Upload",function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.end("Something went wrong!");
            
        }
        console.log('Righr');
        return res.end("File uploaded sucessfully!.");
    });
});

app.get('/uploads/:file', function (req, res){
    file = req.params.file;
    var img = fs.readFileSync(__dirname  +"/Images/"+ file);
    res.setHeader('Content-disposition', 'attachment; filename=' + file);
    res.writeHead(200, {'Content-Type': '*' });
    res.end(img, 'binary');
  
  });
app.get('/',(req,res)=>{
    res.send({
        "key":"value"
    });
});

io.of('/chat').on('connection',(socket)=>{
    console.log('user connected');

    socket.on('createMessage',(data)=>{
        console.log('New Message recieved',data);
        io.of('/chat').emit('newMessage',{
            from:data.from,
            text:data.text,
            createdAt:new Date().toUTCString()
        });
    });

    socket.on('fileUpload',(data)=>{
        console.log('New File is uploaded',data);
        io.of('/chat').emit('downloadFile',{
            from:data.from,
            text:'http://192.168.72.199:3001/uploads/'+data.text,
            createdAt:new Date().toUTCString()
        });

    })
});


http.listen(3001, '0.0.0.0',()=>{
    console.log('Server has started');
})







