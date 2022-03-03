#include "DHT.h"

//m2
#include <SFE_BMP180.h>
#include <Wire.h>

// CONSTRUCTOR DEL OBJETO DHT RECIBE EL PIN EN EL QUE SE CONECTA EL SENSOR
// Y TAMBIEN RECIBE EL TIPO DE SENSOR QUE VAMOS A CONECTAR
DHT dht(2, DHT11);

SFE_BMP180 bmp180;
double PresionNivelMar=2377;
//Sensor Lluvia

int lluviaSensor = A0;

void setup() {
  // PREPARAR LA COMUNICACION SERIAL
  Serial.begin(9600);
  //Serial.println("Prueba del sensor DHT11");

  // PREPARAR LA LIBRERIA PARA COMUNICARSE CON EL SENSOR
  dht.begin();
  
  
   if (bmp180.begin()){
   // Serial.println("BMP180 iniciado correctamenten");
     
   }
  else
  {
    Serial.println("Error al iniciar el BMP180");
    while(1); // bucle infinito
  }
  
}

void loop() {
  // ESPERAR ENTRE MEDICIONES, NECESARIO PARA EL BUEN FUNCIONAMIENTO
  delay(2000);

  // LEER LA HUMEDAD USANDO EL METRODO READHUMIDITY
  float h = dht.readHumidity();
  // LEER LA TEMPERATURA USANDO EL METRODO READTEMPERATURE
  float t = dht.readTemperature();
  
  // Leemos la temperatura en grados Fahreheit
  float f = dht.readTemperature(true);
  

  // REVISAR QUE LOS RESULTADOS SEAN VALORES NUMERICOS VALIDOS, INDICANDO QUE LA COMUNICACION ES CORRECTA
  if (isnan(h) || isnan(t)) {
    //Serial.println("Falla al leer el sensor DHT11!");
    return;
  }


  // IMPRIMIR RESULTADO AL MONITOR SERIAL

  // Humedad
  Serial.print(h);
  Serial.print(",");
  
  // TEMPERATURA c
  Serial.print(t);
  Serial.print(",");
  
  // TEMPERATURA F
  Serial.print(f);
  Serial.print(",");
  

 
  //Module 2
  
   char status;
  double T,P,A;
  
  status = bmp180.startTemperature();//Inicio de lectura de temperatura
  if (status != 0)
  {   
    delay(status); //Pausa para que finalice la lectura
    status = bmp180.getTemperature(T); //Obtener la temperatura
    if (status != 0)
    {
      status = bmp180.startPressure(3);//Inicio lectura de presión
      if (status != 0)
      {        
        delay(status);//Pausa para que finalice la lectura        
        status = bmp180.getPressure(P,T);//Obtenemos la presión
        if (status != 0)
        {   
          //Temperatura
          Serial.print(T);
          Serial.print(",");
          //Presion
          Serial.print(P);
          Serial.print(",");
          //-------Calculamos la altitud--------
          A= bmp180.altitude(P,PresionNivelMar);
          //altitud
          Serial.print(A);
          Serial.print(",");
        }      
      }      
    }   
  } 
 

 Serial.println(analogRead(lluviaSensor));

}