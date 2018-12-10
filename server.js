const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const { exec } = require('child-process-promise');
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

const opts = {
  useNewUrlParser: true
};

function predictor(reqResolve, reqReject, estado, temperatura) {
	return exec(`Rscript run.R ${estado} ${temperatura}`).then(({stdout, stderr}) => {
	  // the *entire* stdout and stderr (buffered)
	  console.log(`stdout: ${stdout}`);
	  console.log(`stderr: ${stderr}`);
	  let result = 0;
	  if(stdout){
	  	const rex = stdout.match(/^\[1\] (.*)\n$/);
	  	if(rex && Array.isArray(rex) && rex.length>1){
  			result = Number(rex[1]);
  			if(result<0) result = 0;
	  	}
	  }
	  reqResolve(result);
	  return result;
	})
    .catch((err) => {
	  	reqReject("node couldn't execute the command");
    	console.error('ERROR: ', err);
	 	return err;
    });
}
// Serve only the static files form the dist directory

app.use(express.static(__dirname + '/public'));
app.route('/api/*').get((req, res) => {
    const params = req.params && req.params[0] && req.params[0].split('/') || [];
    if (!params || params.length <= 0) {
      return res.status(500).send(`error with: ${params}`);
    }
    const estados = ['Aguascalientes', 'Colima', 'Sinaloa'];
    const estado = params[0];
    const temperatura = params[1];
 
    const getPromise = new Promise((reqResolve, reqReject) => {
    	if(estado.toLowerCase()==='todos'){
    		const promesas = estados.map(est => predictor(()=>{},()=>{}, est, temperatura));
    		Promise.all(promesas).then((res)=> {
    		 reqResolve(res.map((e,i)=>{
    		 	return { estado: estados[i], energia:e };
    		 }));
    		}).catch( err => reqReject(err));
    	} else {
			predictor(reqResolve, reqReject, estado, temperatura);
    	}
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
