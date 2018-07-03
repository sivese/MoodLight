const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const bodyParser = require('body-parser');
const pi = require('wiring-pi');
const ejs = require('ejs');
const serial = require('serialport');
const lame = require('lame');
const Speaker = require('speaker');

const comport = new serial('/dev/ttyACM0',{
  baudRate: 9600,
  dataBits: 8,
  parity: 'none',
  stopBits: 1,
  flowControl: false
});

const app = express();

var audio = {
 channels: 2,
 bitDepth: 16,
 sampleRate: 44100
};

var decoder = lame.Decoder();

let speaker;
var input;
var R = true, G = true, B = true;
var led_on = true;
var led_blink = false;
var music_play = false;

function Play(){
 input = fs.createReadStream('./music/e.mp3');
 speaker = new Speaker(audio);
 
 input.pipe(decoder).pipe(speaker); 
}

function PlayOff(){
 input.unpipe();

 speaker.end();
 //speaker.uncork();
 //speaker.destroy();
}

app.use(fileUpload());

app.use(express.static(__dirname+"/node_modules/bootstrap/dist"));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/mood', function(request, response){
  fs.readFile('./main_page.html', 'utf-8', function(error, data){
    response.send(ejs.render(data));
  });
});

app.get('/mood/control', function(request, response){
  fs.readFile('./control_page.html', 'utf-8', function(error, data){
   response.send(ejs.render(data,{
	RED: R,
	GREEN: G,
	BLUE: B,
	LED_ON: led_on,
	LED_BLINK: led_blink
   }));
  });
});

app.get('/led_on', function(request, response){
 comport.flush((err, result)=>{
   if(err)
    console.log(err);
   else
    console.log(result);
 });

 comport.write("LED_ON$");
 led_on = true;
 response.redirect('/mood/control');
});

app.get('/led_off', function(request, response){
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("LED_OFF$");
 led_on = false;
 response.redirect('/mood/control');
});

app.get('/blink_on', function(request, response){
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("BLINK_ON$");
 led_blink = true;
 response.redirect('/mood/control');
});

app.get('/blink_off', function(request, response){
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("BLINK_OFF$");
 led_blink = false;
 response.redirect('/mood/control');
});

app.get('/red_on', (request, response)=>{
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("R_ON$");
 R = true;
 response.redirect('/mood/control');
});

app.get('/red_off', (request, response)=>{
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("R_OFF$");
 R = false;
 response.redirect('/mood/control');
});

app.get('/green_on', (request, response)=>{
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("G_ON$");
 G = true;
 response.redirect('/mood/control');
});

app.get('/green_off', (request, response)=>{
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("G_OFF$");
 G = false;
 response.redirect('/mood/control');
});

app.get('/blue_on', (request, response)=>{
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("B_ON$");
 B = true;
 response.redirect('/mood/control');
});

app.get('/blue_off', (request, response)=>{
  comport.flush((err, result)=>{
    if(err)
     console.log(err);
    else
     console.log(result);
  });
 comport.write("B_OFF$");
 B = false;
 response.redirect('/mood/control');
});

app.get('/mood/music', function(request, response){
  fs.readFile('./music_page.html', 'utf-8', function(error, data){
    response.send(ejs.render(data,{
	 music: music_play
	}));
  });
});

app.get('/play', (request, response)=>{
 Play();
 music_play = true;

 response.redirect('/mood/music');
});

app.get('/playoff', (request, response)=>{
 PlayOff();
 music_play = false;

 response.redirect('/mood/music');
});

app.post('/upload', function(request, response){
  if(!request.files)
    return response.status(400).send('No files were uploaded!');
  PlayOff();

  fs.unlink('./music/e.mp3', (error)=>{
   if(error) throw error;
   console.log('e.mp3 was deleted....');
  });

  console.log(request.files);

  let file = request.files.music;

  file.mv('./music/e.mp3', function(error){
    if(error)
      return response.status(500).send(error);
    response.redirect('/mood/music');
  });
});

app.listen(65000,
  ()=>{
   pi.wiringPiSetup();
   console.log("Server is running on port 65000");
  }
);
