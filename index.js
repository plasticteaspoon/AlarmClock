var exec = require('child_process').exec; 
var express = require('express'); 
var NeDB = require('nedb');
var spawn = require('child_process').spawn;
var fs = require('fs');

var config;

var readConfig = function () { 
    fs.readFile(__dirname + '/alarmClock.config', 'utf8', 
        function (err, data) {
            if(err) throw err;
            
            config = JSON.parse(data);
        }
    );
}

readConfig();

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
        
    console.log("Playing " + fileName);
    //omxplayer = spawn('omxplayer', ['--vol', balance, __dirname + '/res/Sounds/' + fileName], {shell: 'false'});
    omxplayer = exec('omxplayer --vol ' + balance + ' ' + __dirname + '/res/Sounds/' + fileName);

    omxplayer.on('error', function(error) {
        console.log('Failed to spawn omxplayer. ' + error);
    });    
    omxplayer.stderr.on('data', function(data) {
        console.log('Omxplayer stderr returned: ' + data);
    });
}

setInterval(function () {
    //console.log('checking the date...');
    
    var now = new Date();
    var month = now.getMonth();
    var dayOfMonth = now.getDate();
    var dayOfWeek = now.getDay();
    var hour = now.getHours();
    var minute = now.getMinutes();
    
    if(dayOfWeek == config.alarm1.dayOfWeek & hour == config.alarm1.hour & minute == config.alarm1.minute) {
        playSound('rooster.mp3', '-850');
        //console.log('Alarm has rung');
    }else {
        //console.log('Aalrm has not rung');
    }
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

app.get('/api/alarm-random', function (request, response) {
    fs.readdir(__dirname + '/res/Sounds/Alarms', function (err, files) {
        var arrayNumber = Math.floor(Math.random() * files.length);
        playSound('Alarms/' + files[arrayNumber], '0');
    });

    response.send();
});

app.post('/api/killOmx', function (request, response) {
    exec("kill $(ps -o pid,command -ax | grep omxplayer.bin | grep -v grep | awk '{print $1}')");

    response.send();
});

app.post('/api/refreshConfig', function (request, response) {
    readConfig();
    console.log('read config');
    
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
