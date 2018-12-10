const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const { exec } = require('child_process');


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const opts = {
  useNewUrlParser: true
};

function predictor(reqResolve, reqReject, estado, temperatura) {
	exec(`Rscript run.R ${estado} ${temperatura}`, (err, stdout, stderr) => {
	  if (err) {
	  	reqReject("node couldn't execute the command");
	    // node couldn't execute the command
	    return;
	  }

	  // the *entire* stdout and stderr (buffered)
	  console.log(`stdout: ${stdout}`);
	  console.log(`stderr: ${stderr}`);
	  let result = 0;
	  if(stdout){
	  	const rex = stdout.match(/^\[1\] (.*)\n$/);
	  	if(rex && Array.isArray(rex) && rex.length>1){
  			result = Number(rex[1]);
	  	}
	  }
	  reqResolve(result);
	});
}
// Serve only the static files form the dist directory

app.use(express.static(__dirname + '/public'));
app.route('/api/*').get((req, res) => {
    const params = req.params && req.params[0] && req.params[0].split('/') || [];
    if (!params || params.length <= 0) {
      return res.status(500).send(`error with: ${params}`);
    }

    const estado = params[0];
    const temperatura = params[1];

 
    const getPromise = new Promise((reqResolve, reqReject) => {
      predictor(reqResolve, reqReject, estado, temperatura);
    });
    getPromise.then(result => {
      if (!result)
        res.status(404).json('error');
      else
        res.status(200).json({result});
      return result;
    }).catch(e => {
      res.status(501).send(`error ${e}`);
      console.log('error', e);
    });
  });

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
