const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jwt-simple');
const app = express();
const port = 8080;

const config = require('./config.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


function check_jwt(aafjwt) {

	if( aafjwt['iss'] !== config['iss'] ) {
		console.log(`iss ${aafjwt['iss']} mismatch with ${config['iss']}`);
		return false;
	}

	if( aafjwt['aud'] !== config['aud'] ) {
		console.log(`aud ${aafjwt['aud']} mismatch with ${config['aud']}`);
		return false;
	}

	const nbf = new Date(aafjwt['nbf']);
	const exp = new Date(aafjwt['exp']);
	const now = new Date();

	if( !! ( now > nbf && now < exp ) ) {
		console.log(`Time assertion fail ${nbf} > ${now} > ${exp}`);
		return false;
	}

	return true;
}



app.get('/', (req, res) => {
	res.redirect(302, config['aafURL']);
});


app.get('/no', (req, res) => res.sendStatus(403) )

app.post('/jwt', (req, res) => {

	const aafjwt = jwt.decode(req.body['assertion'], config['secret']);
	console.log(JSON.stringify(aafjwt, null, 8))
	if( check_jwt(aafjwt) ) {
		res.send('AAF authentication worked');
	} else {
		res.sendStatus(403);
	}

})




app.listen(port, '0.0.0.0', () => console.log(`express-aaf listening on ${port}`));