#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

#define EOT '$'
#define LED 6

#define NUM_LEDS 16

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LEDS, LED, NEO_GRBW + NEO_KHZ800);

char arr[100] = "";
int inchar, i=0, used=1;
char msg_res[100]="";
bool on = true;
bool _blink = false;
bool music = true;

byte R = 255;
byte G = 255;
byte B = 255;

void setup() {
  #if defined (__AVR_ATtiny85__)
    if (F_CPU == 16000000) clock_prescale_set(clock_div_1);
  #endif
  strip.begin();
  strip.show();
  Serial.begin(9600);
}

void loop() {
  int k;

  Get_Message();
  Read_Message();
  Blink_LED();
  
  for(int p=1;p<=NUM_LEDS;p++)
    strip.setPixelColor(p, strip.Color(R,G,B));
    
  strip.show();
}

void Blink_LED(){
  static bool bright = true;

  R--; G--; B--;
}

void Read_Message(){
  while(used==0){
    if(strcmp(arr,"LED$")==0){
      if(on)
        on = false;
      else
        on = true; 
    }
    else if(strcmp(arr,"RED$")==0){
      if(R==255)
        R = 0;
      else
        R = 255;
    }
    else if(strcmp(arr,"GREEN$")==0){
      if(G==255)
        G = 0;
      else
        G = 255;
    }
    else if(strcmp(arr,"BLUE$")==0){
      if(B==255)
        B = 0;
      else
        B = 255;
    }
    else if(strcmp(arr,"BLINK$")==0){
      if(_blink)
        _blink = false;
      else
        _blink = true;
    }
    else if(strcmp(arr,"MUSIC$")==0){
      if(music)
        music = false;
      else
        music = true;
    }

    used = 1;
    i = 0;
    
    memset(arr, 0, 100);
  }
}

void Get_Message(){
  while(Serial.available()>0){
    inchar = Serial.read();
    arr[i] = (char)inchar;
    
    if(arr[i]==EOT)
      used = 0;
    
    i++;
  }
}
