'use strict';

const express = require('express');
const app = express();
const { retrieveContactList } = require('../model/mysql');

/**
* API Resource to retrieve the contact list. This calls the
* retrieveContactList() function from the (../model/mysql.js) file, and
* sends the result in JSON format.
*
* If an empty array is received (which would happen with an empty contact
* list), then the resulting JSON is: {"resultCount":0,"results":[]}
*
*
* @author Alberto Pérez Romero
* @param {string} '/contacts' The name of the resource that invokes this code.
* @param {function} An anonymous function with an HttpRequest and HttpResponse
*										as its parameters. These HTTP objects are used to process
*										the business logic.
* @returns A JSON file piped into the response containing the contact list.
*/
app.get('/contacts', function(req, res) {
	/*return res.json({
      'resultCount': 1,
      'results': [{
          contactId: 1,
          firstName: 'Johnny',
          lastName: 'Smith',
          phone: '0800SMITH',
          imgUrl: process.env.DEFAULT_USER_IMG_URL,
          thumbnailUrl: process.env.DEFAULT_USER_THUMB_URL
      }]
  });*/
	retrieveContactList((err, contactArray) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				err
			});
		}
		// Inferred else:
		if (contactArray.length > 0) {
			return res.json(contactArray);
		} else {
			return res.json({
				'resultCount': 0,
				'results': []
			});
		}
	});
});

module.exports = app;
