#setwd("/Users/jonathan/Desktop/maestria/15_02/entregable/")
library(shiny)


var_estado <- 'Colima'
var_temperatura <- 40;

ds = read.csv("tresestados2017.csv", header = TRUE)
ds$electricidad<-ds$electricidad/1000000 #Kwh -> Gwh

ds <- ds[ds$estado== var_estado,]

model<- lm(electricidad ~ temperatura, data=ds)

new.temperatura <- data.frame(temperatura = c(var_temperatura)) 
pred.int <- predict(model, newdata = new.temperatura, interval = "confidence")


resultado <- pred.int[1]

resultado


port <- Sys.getenv('PORT')

shiny::runApp(
  appDir = getwd(),
  host = '0.0.0.0',
  port = as.numeric(port)
)
