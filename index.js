const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const jwt = require('jwt-simple');
const app = express();

const config = require('./config.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('trust proxy', 1);

app.use(session({
	name: config['sessionName'],
	keys: [ 'uid', 'displayName', 'affiliation' ]
}));

function check_jwt(authjwt) {

	if( authjwt['iss'] !== config['iss'] ) {
		console.log(`iss ${authjwt['iss']} mismatch with ${config['iss']}`);
		return false;
	}

	if( authjwt['aud'] !== config['aud'] ) {
		console.log(`aud ${authjwt['aud']} mismatch with ${config['aud']}`);
		return false;
	}

	const nbf = new Date(authjwt['nbf']);
	const exp = new Date(authjwt['exp']);
	const now = new Date();

	if( !! ( now > nbf && now < exp ) ) {
		console.log(`Time assertion fail ${nbf} > ${now} > ${exp}`);
		return false;
	}

	return true;
}



app.get('/', (req, res) => {
	res.redirect(302, config['authURL']);
});


app.post('/jwt', (req, res) => {

	const authjwt = jwt.decode(req.body['assertion'], config['secret']);
	console.log(JSON.stringify(authjwt, null, 8))
	if( check_jwt(authjwt) ) {
		console.log("AAF authentication was successful");
		const atts = authjwt[config['attributes']];
		req.session.uid = atts['mail'];
		req.session.displayName = atts['displaybame'];
		req.session.affiliation = atts['edupersonscopedaffiliation'];
		res.redirect(config['success']);
	} else {
		console.log("AAF authentication failed");
		res.sendStatus(403);
	}

})


app.get('/logout', ( req, res ) => {
	req.session.uid = '';
	req.session.displayName = '';
	req.session.affiliation = '';
});


app.listen(config['port'], config['host'], () => console.log(`express-aaf listening on ${config['host']}:${config['port']}`));