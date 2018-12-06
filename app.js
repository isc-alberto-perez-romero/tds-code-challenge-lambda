'use strict';

require('./config/config.js');

//const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
//const compression = require('compression');
const busboy = require('connect-busboy');
const busboyBodyParser = require ('busboy-body-parser');

const awsServerlessExpressMiddleware =
                              require('aws-serverless-express/middleware');
const app = express();
const router = express.Router();
// Import function to set up DB connection:
const { setUpConnection } = require('./model/mysql');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(awsServerlessExpressMiddleware.eventContext());
router.use(cors());

// Prepare DB pool:
setUpConnection();

router.get('/', (req, res) => {
	res.status(200).json({
		message: 'Lambda is listening here!'
	});
});

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000);

app.use('/', router);
// Use busboy for file uploading:
app.use(busboy());
// Add busboy body parser:
app.use(busboyBodyParser());
app.use(require('./routes/contacts'));
app.use(require('./routes/lambdaLogic'));
app.use(cors());

// Export your express server so you can import it in the lambda function.
module.exports = app;
