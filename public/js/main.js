
   google.charts.load("current", {
    packages: ["geochart"],
    // Note: you will need to get a mapsApiKey for your project.
    // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
    mapsApiKey: "AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY"
  });
  google.charts.setOnLoadCallback(drawRegionsMap);

  function drawRegionsMap() {
  var data = google.visualization.arrayToDataTable([
        ["Estado", "Consumo"]
      ]);

    var options = { region: "MX", resolution: "provinces" };

    var chart = new google.visualization.GeoChart(
      document.getElementById("map")
    );

    chart.draw(data, options);
  }

  function loadDoc(e) {
    e.preventDefault();
    var form = document.getElementById("formTemp");
    if(!form.checkValidity()){
       return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var dataOpt = JSON.parse(this.responseText);
        var aDataGral = [];
        aDataGral.push(['State', 'Energia']);
        if (dataOpt.result.length > 1){
          for(var i in dataOpt.result)
          {
               var estadoVal = dataOpt.result[i].estado;
               var temperaturaVal = dataOpt.result[i].energia;
               aDataGral.push([estadoVal, temperaturaVal ]);
          }
        }
        else {
          aDataGral.push([dataOpt.result.estado,dataOpt.result.energia]);
        }
        
          var data = google.visualization.arrayToDataTable(aDataGral);
          var options = {region: "MX", resolution: "provinces"};
          var chart = new google.visualization.GeoChart(document.getElementById('map'));
          chart.draw(data, options);
      }
    };
    
    var temperatura = document.getElementById("txtTemperatura").value;
    var state = document.getElementById("ddlEstado").val;
    var e = document.getElementById("ddlEstado");
    var estado = e.options[e.selectedIndex].value;
    xhttp.open("GET", "https://backend-r-predictor.herokuapp.com/api/"+estado+"/"+temperatura, true);
    xhttp.send();
  }