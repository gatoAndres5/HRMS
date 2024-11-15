/*
  MAX30105 Breakout: Output all the raw Red/IR/Green readings
  By: Nathan Seidle @ SparkFun Electronics
  Date: October 2nd, 2016
  https://github.com/sparkfun/MAX30105_Breakout

  Outputs all Red/IR/Green values.

  Hardware Connections (Breakoutboard to Arduino):
  -5V = 5V (3.3V is allowed)
  -GND = GND
  -SDA = A4 (or SDA)
  -SCL = A5 (or SCL)
  -INT = Not connected

  The MAX30105 Breakout can handle 5V or 3.3V I2C logic. We recommend powering the board with 5V
  but it will also run at 3.3V.

  This code is released under the [MIT License](http://opensource.org/licenses/MIT).
*/

#include <Wire.h>
#include "MAX30105.h"
#define LOCAL_PORT 8181
#define REMOTE_IP "192.168.0.4"
#define BUF_SZ 128

MAX30105 particleSensor;
UDP Udp;
uint32_t red;
uint32_t ir;
uint32_t green;

#define debug Serial //Uncomment this line if you're using an Uno or ESP
//#define debug SerialUSB //Uncomment this line if you're using a SAMD21

void setup()
{
  debug.begin(9600);
  debug.println("MAX30105 Basic Readings Example");
  while(1) {
    // Initialize sensor
    if (particleSensor.begin() == false)
    {
      debug.println("MAX30105 was not found. Please check wiring/power. ");
      System.sleep (1);
    } else {
      debug.println("MAX30105 ready");
      break;
    }
  }
  particleSensor.setup(); //Configure sensor. Use 6.4mA for LED drive
  WiFi.connect();
  while(1) {
    if (WiFi.ready()) {
      break;
    }
    System.sleep(1);
  }
  debug.println("Wifi ready");
  Udp.begin(LOCAL_PORT);
  Log.info("localIP=%s", WiFi.localIP().toString().c_str());
}

void loop()
{
  char buffer[BUF_SZ];
  int avail;
  /*
  while((avail = particleSensor.available()) == 0) {
    sprintf(buffer, "num available is %d", avail);
    debug.println(buffer);
  }
  */
  red = particleSensor.getRed();
  ir = particleSensor.getIR();
  green = particleSensor.getGreen();
  sprintf(buffer, "%d,%d,%d\n", red, ir, green);
  Udp.beginPacket(REMOTE_IP, LOCAL_PORT);
  Udp.write(buffer);
  Udp.endPacket();
  /*
  debug.print(" R[");
  debug.print(red);
  debug.print("] IR[");
  debug.print(ir);
  debug.print("] G[");
  debug.print(green);
  debug.print("]");

  debug.println();
  */
}
