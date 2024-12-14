SYSTEM_THREAD(ENABLED);
SYSTEM_MODE(SEMI_AUTOMATIC);

#include <Wire.h>
#include "MAX30105.h"


enum State {IDLE, WAIT , MEASURE, PROCESS, OFFLINEUPLOAD, ERROR};
State currentState = IDLE;

float o2Vlaue;
float beatPerMinute;
MAX30105 partSensor;

int wait = 30; //number of minutes between measurements, default 30
bool Online = false;
long offLineBPM[(24*60)] = {0}; // 1 minutes is the lowest number of values recorded over 24 hours
long offLineO2[(24*60)] = {0};
int offLineNumTimes=0;
bool firstReading = true; //special variable because the first reading of the device 

int startHour = 6; //default 6am az time
int startMinute = 0;
int endHour = 22; //default 10pm az time
int endMinute = 0;

int uploadDelay=0;
int ledCount=0;
long irValue = 0;
long redValue=0;
String dataRead;


bool timeValid(){
    int currentHour = Time.hour();
    int currentMin = Time.minute();

   if (startHour <= endHour) {
        // Case 1: Time range is within the same day
        if ((currentHour > startHour || (currentHour == startHour && currentMin >= startMinute)) &&
            (currentHour < endHour || (currentHour == endHour && currentMin <= endMinute))) {
            return true;
        }
    } else {
        // Case 2: Time range spans past midnight
        if ((currentHour > startHour || (currentHour == startHour && currentMin >= startMinute)) || 
            (currentHour < endHour || (currentHour == endHour && currentMin <= endMinute))) {
            return true;
        }
    }

    return false;
}

int updateWait(String waitTemp){//handles time inbetween measuring of the heart rate
    
    Serial.println("Entered wait handler");

    wait = waitTemp.toInt();

    if(wait < 1){
        wait = 1;
    }
    return 1;
}

int updateStart(String startTemp){//handles start time from server
    
    Serial.println("Entered start handler");

    int colonIndex = startTemp.indexOf(':');  // Find the index of the colon (":")
    startHour = startTemp.substring(0, colonIndex).toInt();  // Get the hours as an integer
    startMinute = startTemp.substring(colonIndex + 1).toInt(); 

    return 1;
}

int updateEnd(String endTemp){//handles end time from server
    
    Serial.println("Entered end handler");

    int colonIndex = endTemp.indexOf(':');  // Find the index of the colon (":")
    endHour = endTemp.substring(0, colonIndex).toInt();  // Get the hours as an integer
    endMinute = endTemp.substring(colonIndex + 1).toInt(); 

    return 1;
}

//initalizations
void setup(){
    Serial.begin(9600);
    Serial.println("Initializing...");

    Particle.function("freq", updateWait);
    Particle.function("start", updateStart);
    Particle.function("end", updateEnd);

    WiFi.connect();  // Ensure Wi-Fi connection

    Particle.connect(); // Explicitly connect to the cloud
    Particle.syncTime();
    Time.zone(-7); //Set to arizona time


    if(!partSensor.begin(Wire, I2C_SPEED_FAST)){
        Serial.println("MAX30105 was not found. Check wiring/power.");
        while(1);
    }
    
    partSensor.setup();

    RGB.control(TRUE);
     

}

//loop of code that runs
void loop(){

    
    if(firstReading){
        delay(2500); //delay becasue first reading always counted as not online
        firstReading = false;

    }
     
    switch(currentState){
        case IDLE:
            if(timeValid()){ 
                currentState=MEASURE;
            }
            delay(1000);
        break;
        
        case MEASURE:
            irValue = partSensor.getIR();
            redValue = partSensor.getRed();

            if(ledCount < 300){//300 seconds = 5 minutes
                RGB.color(0,0,255);    //Flash blue to alert the user to take a meaurement
                delay(500);
                RGB.color(0,0,0);
                delay(500);
                ledCount++;
            }

            if((irValue > 73000) ){ //BPM minumum range of 40 depending on age and fitness level ir 73k 
                currentState = PROCESS;
                ledCount = 0;
                
            }
        break;

        case PROCESS: 
            beatPerMinute = irValue / 1831.0;
            o2Vlaue = 110 - 25* (redValue/irValue);
            if(o2Vlaue > 100){o2Vlaue = 100;} //cannot have over 100% O2
            dataRead = "{\"BPM\":"+ String(beatPerMinute) + ",\"O2\":" + String(o2Vlaue) + "}";
            //Serial.println(dataRead);

            Online = Particle.publish("reading", dataRead, PRIVATE);

            if(!Online){
                offLineBPM[offLineNumTimes]=beatPerMinute;
                offLineO2[offLineNumTimes]=o2Vlaue;

                offLineNumTimes++;
                RGB.color(255,255,0); //Yellow light for not sent to server
                delay(1000);
                RGB.color(0,0,0);

                if(offLineNumTimes >= (24*60)){ //Max number of values that it can save
                    offLineNumTimes = (24*60)-1; //Will just replace the last saved data, not a perfect solution, but it works
                }
                
            }
            else{
                RGB.color(0,255,0); //green light for sent to server
                delay(1000);
                RGB.color(0,0,0);
            }

            currentState = OFFLINEUPLOAD;
        break;

        case OFFLINEUPLOAD:
            if(Online && (offLineNumTimes != 0)){               
                for(int i = 0; i < offLineNumTimes; i++){
                    dataRead = "{\"BPM\":"+ String(offLineBPM[i]) + ",\"O2\":" + String(offLineO2[i]) + "}";

                    Particle.publish("reading", dataRead, PRIVATE);
                    delay(10000);
                    uploadDelay++;
                }

                //dataRead = "{\"BPM\":"+ String(beatPerMinute) + ",\"O2\":" + String(o2Vlaue) + "}";
                //Particle.publish("reading", dataRead, PRIVATE);

                offLineNumTimes =0;
                
            }

            currentState = WAIT;
        break;

        case WAIT:

            for(int j=0;j<(wait-(uploadDelay/6));j++){
                delay(60000);
            }
            uploadDelay = 0; //turn upload delay back to 0 after it has been accounted for
            
            if(!timeValid){
                currentState = IDLE;
            }
            else{
                currentState=MEASURE;
            }
        break;

        case ERROR:
            RGB.color(255,0,0); //red for error
            delay(500);
            RGB.color(0,0,0);
        break;

        default:
            currentState = IDLE;
        break;
        
    }
    
}