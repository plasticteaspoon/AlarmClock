var exec = require('child_process').exec;
var express = require('express');
var NeDB = require('nedb');

var db = new NeDB({filename: __dirname + '/log.nedb', autoload: true});
var app = express();

app.use(express.static(__dirname + '/html'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/html/home.html');
});

app.get('/school-week', function (request, response) {
    exec('crontab /home/jessica/AlarmClock/Express/school-week.cron');
    response.send('School alarms are go!!!');
});

app.get('/no-alarm', function (request, response) {
    exec('crontab -r');
    response.send('School alarms are gone!!!');
});

app.get('/crontab', function (request, response) {
    exec('crontab -l', function (error, stdout, stderr) {
        response.set('Content-Type', 'text/plain');
        response.send(stdout);
    });
});

app.get('/api/myName', function (request, response) {
    response.set('Content-Type', 'application/json');
    response.send(JSON.stringify({ 'name' : 'Roger' }));
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
    var log = {name: 'Jessica summoned', 'date': new Date()};
    
    exec('omxplayer ' + __dirname + '/res/Sounds/rooster.mp3');
    
    db.insert(log, function (err, log) {
        if(!err) {
            console.log('Log added successfully');
        } else {
            console.log('Log failed to be added. It is ' + err);
    }
    });
    
    response.send();
});

app.post('/api/callJess/dinner', function (request, response) {
    var log = {name: 'Jessica called for dinner', 'date': new Date()};
    
    exec('omxplayer ' + __dirname + '/res/Sounds/deer.mp3');
    
    db.insert(log, function (err, log) {
        if(!err) {
            console.log('Log added successfully');
        } else {
            console.log('Log failed to be added. It is ' + err);
    }
    });
    
    response.send();
});


app.get('/api/getLogs', function (request, response) {
    db.find({}, function (err, logs) {
        console.log('found ' + logs.length + ' logs');
    
        response.set('Content-Type', 'application/json');
        response.send(JSON.stringify(logs));
    }); 
});

app.listen(8080, function () {
    console.log('server started');
});
