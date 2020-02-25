const express = require('express');
const app = express();
const port = 3000;


app.get('/yes', (req, res) => {
	console.log(JSON.stringify(req.headers));
	res.send('success')
});
app.get('/no', (req, res) => res.sendStatus(403) )

app.listen(port, '0.0.0.0', () => console.log(`Auth-o-matic on ${port}`));