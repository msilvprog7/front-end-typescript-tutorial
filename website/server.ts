/**
 * Required modules and instances
 */
var express = require('express'),
	app = express();


/**
 * Set up app for express
 */
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname));


/**
 * Routes
 */

/**
 * Home Route (/)
 * Use this end point to render the web page
 */
app.post('/', function (req, res) {
	res.render("index.html");
});


/**
 * Make app listen on specified port
 */
app.listen(app.get('port'), function () {
	console.log("Server on port", app.get('port'));
});