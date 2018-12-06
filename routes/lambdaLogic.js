'use strict';

require('../config/config');

const {processImage} = require ('../helpers/processImage');
const {processContact} = require ('../helpers/processContact');
const {processError} = require ('../helpers/processError');

const Busboy = require('busboy');
const express = require('express');
const app = express();

/**
* API resource to test Lambda function. This is merely a quick check that
* there is a response when the function is deployed.
*
* @author Alberto Pérez Romero
* @param {string} '/addContactInfo' The name of the resource that invokes
*																		this code (GET method).
* @param {function} An anonymous function with an HttpRequest and HttpResponse
*										as its parameters. These HTTP objects are used to process
*										the business logic.
* @returns A JSON file piped into the response with a simple message.
*/
app.get('/addContactInfo', function(req, res){
	res.status(200).json({
		message: 'lambda is listening here as well!'
	});
});

/**
* API Resource to insert a new contact. This calls the
* processImage() function from the (../helpers/processImage.js) file, and
* the processContact() function from the (../helpers/processContact.js) file.
*
* The logic behind this function is the following:
*
*
* 1. Retrieve information from the received HttpRequest object.
* 2. Process the image by resizing it, and uploading both the original and the
*			thumbnail into an Amazon S3 bucket.
* 3. Save the complete contact information in the database.
*
* Finally, it returns the complete contact as a JSON object.
*
* @author Alberto Pérez Romero
* @param {string} '/addContactInfo' The name of the resource that invokes
*																		this code (POST method).
* @param {function} An anonymous function with an HttpRequest and HttpResponse
*										as its parameters. These HTTP objects are used to process
*										the business logic.
* @returns A JSON file piped into the response containing the new contact's
*						information.
*/
app.post('/addContactInfo', function(req, res) {
	/*res.status(200).json({
    message: 'logic to add contacts goes here!'
  });*/
	//console.log('Received headers below:');
	//console.log(req.headers);
	let busboy = new Busboy({headers: req.headers});

	busboy.on('finish', () => {
		/*console.log('request below:');
    console.log(req);*/

		// 1. Retrieve and assign all needed information from request:
		const contactPicFile = req.files.contactPicFile;
		console.log('contactPicFile='+contactPicFile);

		// 1A (preferred): If the contact information was sent in a JSON:
		let contact = JSON.parse(req.body.contact);

		// 1B (Proven to work in PROD): If the contact information was sent
		// in the query String:
		/* let firstName = req.query.first_name;
    let lastName = req.query.last_name;
    let phone = req.query.phone;

    let contact = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      img_url: '',
      thumbnail_url: '',
    };*/
		console.log('contact='+JSON.stringify(contact));


		// boolean value used for clarity:
		let useDefaultImage = !(contactPicFile);

		if(!useDefaultImage){
			// 2. Process image...
			processImage(contactPicFile, (err, imgUrlString, thmbnlUrlString) => {
				if(err) {
					// If there were any errors:
					let errorMessage = 'ERROR while processing image. Information ' +
                             'was not saved...';
					processError(err, errorMessage, res);
					return;
				}
				// Else, there were no problems with the images.
				console.log('Image saved - Retrieve at: '+ imgUrlString);
				console.log('Thumbnail saved - Retrieve at: '+ thmbnlUrlString);

				// 3. Move on to save contact.
				processContact(contact, imgUrlString, thmbnlUrlString,
					(err, contact)=>{
						if(err){
							// If there were any errors:
							let errorMessage = 'ERROR while processing contact information.' +
            processError(err, errorMessage, res);
							return;
						}
						// Else, contact was inserted successfully!
						console.log('Contact inserted. Returning:');
						console.log(JSON.stringify(contact));
						// 4. Finally, return complete contact as JSON.
						res.json(contact);
					});
			});
		} else {
			// 2. Just insert contact info (no need to process images)...
			let imgUrlString = process.env.DEFAULT_USER_IMG_URL;
			let thmbnlUrlString = process.env.DEFAULT_USER_THUMB_URL;
			console.log('Default images used. No images were processed.');

			// 3. Move on to save contact.
			processContact(contact, imgUrlString, thmbnlUrlString,
				(err, contact) => {
					if(err){
						// If there were any errors:
						let errorMessage = 'ERROR while processing contact information.' +
          processError(err, errorMessage, res);
						return;
					}
					// Else, contact was inserted successfully!
					console.log('Contact inserted. Returning:');
					console.log(JSON.stringify(contact));
					// 4. Finally, return complete contact as JSON.
					res.json(contact);
				});
		}
	});
	req.pipe(busboy);
});

module.exports = app;
