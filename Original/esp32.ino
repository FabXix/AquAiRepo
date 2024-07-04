#include <WiFi.h>
#include <WebServer.h>
#include <DallasTemperature.h>
#include <OneWire.h>


const char* ssid = "SSID";
const char* password = "CONTRASEÑA";


WebServer server(80);


#define ONE_WIRE_BUS 4  
#define TDS_PIN 35  
#define PH_PIN 34  

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected.");

  server.on("/", handleRoot);
  server.begin();
  Serial.println("HTTP server started");


  sensors.begin();
}

void loop() {
  server.handleClient();
}

void handleRoot() {

  sensors.requestTemperatures();
  float temperature = sensors.getTempCByIndex(0);


  int tdsValue = analogRead(TDS_PIN);
  int phValue = analogRead(PH_PIN);


  float tds = (float)tdsValue * (5.0 / 4095.0); // Assume 5V and 12-bit ADC
  float ph = (float)phValue * (14.0 / 4095.0); // Assume 0-14 pH scale

  String jsonResponse = "{";
  jsonResponse += "\"temperature\":" + String(temperature) + ",";
  jsonResponse += "\"tds\":" + String(tds) + ",";
  jsonResponse += "\"ph\":" + String(ph);
  jsonResponse += "}";

  server.send(200, "application/json", jsonResponse);
}
