const express = require('express');
const jwt = require('jwt-simple');
const app = express();
const port = 8080;

const config = require('./config.json');

function check_jwt(aafjwt) {

	if( aafjwt['iss'] !== config['iss'] || aafjwt['aud'] !== config['aud'] ) {
		return false;
	}

	const nbf = new Date(aafjwt['nbf']);
	const exp = new Date(aafjwt['exp']);
	const now = new Date();

	return ( now > nbf && now < exp );

}



app.get('/', (req, res) => {
	res.redirect(302, config['aafURL']);
});


app.get('/no', (req, res) => res.sendStatus(403) )

app.post('/jwt', (req, res) => {
	console.log(JSON.stringify(req.params));
	const aafjwt = jwt.decode(req.params['assertion'], config['secret']);

	if( check_jwt(aafjwt) ) {
		res.send('AAF authentication worked');
	} else {
		res.sendStatus(403);
	}

})




app.listen(port, '0.0.0.0', () => console.log(`express-aaf listening on ${port}`));