var express = require('express');
var http = require('http');
var compilerArray = require('./compilers');
var sandBox = require('./DockerSandbox');
var bodyParser = require('body-parser');

var ExpressBrute = require('express-brute');
var store = new ExpressBrute.MemoryStore();

var store = new MemoryStore(); // stores state locally, don't use this in production
var bruteforce = new ExpressBrute(store, {
    freeRetries: 100,
    lifetime: 3600
});

var app = express();
var server = createServer(app);
var port = 8080;

app.use(static(__dirname));
app.use(bodyParser());

app.all('*', function (request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

function random(size) {
    return require("crypto").randomBytes(size).toString('hex');
}

app.post('/compile', bruteforce.prevent, function (request, response) {
    var language = request.body.language;
    var code = request.body.code;
    var stdin = request.body.stdin;

    var folder_id = random(10);

    var folder = 'temp/' + folder_id; //folder in which the temporary folder will be saved
    var path = __dirname + "/"; //current working path
    var vm_name = 'virtual_machine'; //name of virtual machine that we want to execute
    var timeout_value = 5; //Timeout Value, In Seconds

    console.log("Recieved request for folder id " + folder_id);

    //details of this are present in DockerSandbox.js
    var sandboxType = new sandBox(
        timeout_value,
        path,
        folder,
        vm_name,
        compilerArray[language][0],
        compilerArray[language][1],
        code,
        compilerArray[language][2],
        compilerArray[language][3],
        compilerArray[language][4],
        stdin);


    //data will contain the output of the compiled/interpreted code
    //the result maybe normal program output, list of error messages or a Timeout error
    sandboxType.run((data, exec_time, err) => {
        response.send({ output: data, langid: language, code: code, errors: err, time: exec_time });
    });
});


app.get('/', function (request, response) {
    response.sendFile("./index.html");
});

console.log("Listening at " + port)
server.listen(port);
