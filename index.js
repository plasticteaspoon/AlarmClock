var exec = require('child_process').exec; 
var express = require('express'); var NeDB = require('nedb');
var spawn = require('child_process').spawn;

var db = new NeDB({filename: __dirname + '/log.nedb', autoload: true});
var app = express();

var omxplayer;

app.use(express.static(__dirname + '/html'));
 
var insertLog = function (entry) {
    entry.date = new Date();
    db.insert(entry, function (err) {
        if(!err) {
        } else {
            console.log('Log failed to be added. It is ' + err);
        }
    });
}

var playSound = function (fileName, balance) {    

    omxplayer = spawn('omxplayer', ['--vol', balance, __dirname + '/res/Sounds/' + fileName], {shell: 'false'});
    //omxplayer = exec('omxplayer --vol ' + balance + ' ' + __dirname + '/res/Sounds/' + fileName);

    omxplayer.on('error', function(error) {
        console.log('Failed to spawn omxplayer. ' + error);
    });    
    omxplayer.stderr.on('data', function(data) {
        console.log('Omxplayer stderr returned: ' + data);
    });
}

setInterval(function () {
    var month = new getMonth();
    var day-of-month = new getDate();
    var day-of-week = new getDay();
    var hour = new getHours();
    var minute = new getMinutes();

    var config = 
        {
            'alarm1' : {
                           dayWeek' : '0'
                           ''
                       }
        };
}, 60000);

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/html/home.html');
});

app.get('/api/crontab', function (request, response) {
    exec('crontab -l', function (error, stdout, stderr) {
            response.set('Content-Type', 'application/json');
            response.send(JSON.stringify({'crontab' : stdout}));
    });
});

app.post('/api/alarmOn', function (request, response) {
   exec('crontab ' + __dirname + '/school-week.cron');
   response.send();
});

app.post('/api/alarmOff', function (request, response) {
   exec('crontab -r');
   response.send();
});

app.post('/api/callJess/come', function (request, response) {
    
    playSound('rooster.mp3', '-850');
    
    insertLog({name: 'Jessica summoned'});
    
    response.send();
});

app.post('/api/callJess/dinner', function (request, response) {
        
    playSound('dinner.mp3', '1000');
    
    insertLog({name: 'Jessica called for dinner'});
    
    response.send();
});

app.post('/api/callJess/music', function (request, response) {
    
    playSound('music.mp3', '1000');
    
    insertLog({name: 'Jessica called told to do music practice'});
    
    response.send();
});

app.post('/api/killOmx', function (request, response) {
    exec("kill $(ps -o pid,command -ax | grep omxplayer.bin | grep -v grep | awk '{print $1}')");

    response.send();
});

app.get('/api/getLogs', function (request, response) {
    db.find({}, function (error, data) {
        response.set('Content-Type', 'application/json');
        response.send(JSON.stringify(data));
    });
});

app.listen(8080, function () {
    console.log('server started');
});
