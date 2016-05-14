var exec = require('child_process').exec;
var express = require('express');
var app = express();

app.use(express.static('html'));

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

app.listen(8080, function () {
    console.log('server started');
});
