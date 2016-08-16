/**
 * Required modules and instances
 */
import {HashedLinkedList} from "./js/list";
let express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	clientDir = __dirname + "/../client",
	posts = new HashedLinkedList<Post>();


/**
 * Set up app for express
 */
app.set('port', (process.env.PORT || 5000));
app.use(express.static(clientDir));
app.use(bodyParser.json({limit: "5mb"}));
app.use(bodyParser.urlencoded({extended: true, limit: "5mb"}));


/**
 * Routes
 */

/**
 * Home Route (/)
 * Use this end point to render the web page
 */
app.post('/', function (req, res) {
	console.log(posts);
	res.render("index.html");
});

/**
 * Post Route (/post)
 * Use this end point to submit TextPosts or ImagePosts
 */
app.post("/post", function (req, res) {
	if (req.body && req.body.post) {
		posts.insertAtTail(req.body.post as Post);
	}
	console.log(posts);
	res.status(200).send();
});

/**
 * Retrieve route (/posts/)
 * Use this end point to retrieve all TextPosts or ImagePosts
 */
app.get("/posts/", function (req, res) {
	res.status(200).send({
		posts: posts.getList()
	});
});

/**
 * Retrieve route (/posts/{id})
 * Use this end point to retrieve TextPosts or ImagePosts after
 * the specified id
 */
app.get("/posts/:id", function (req, res) {
	res.status(200).send({
		posts: posts.getListStartingFromNext(req.params.id)
	});
});

/**
 * Make app listen on specified port
 */
app.listen(app.get('port'), function () {
	console.log("Server on port", app.get('port'));
});