'use strict';

const {insertContactInfo} = require ('../model/mysql');
/**
* This function calls the insertContactInfo() function inside
* (../model/mysql.js) to insert a new contact.
*
* @author Alberto Pérez Romero
* @param {Contact} contact A Contact object, containing an id (set by the db),
*										a String for his or her first name, another for his or her
*										last name, another for the phone number, another for the
*										URL where his or her picture is uploaded, and one more for
*										the thumbnail's storage location URL.
* @param {string} imgUrlString A String with the main picture's URL location.
*										This field is set in this function.
* @param {string} thmbnlUrlString A String with the thumbnail's URL location.
*										This field is set in this function.
* @param {function} callback A function to be called once the contact has been
*										inserted in the database, which is called with only an
*										error, should it happen, as the only parameter; or with
*										null as the first parameter and the complete contact object
*										as the second, if everything goes as expected.
*/
const processContact = (contact, imgUrlString, thmbnlUrlString, callback) => {
	if(contact){
		// Assign the URL Strings:
		contact.img_url = imgUrlString;
		contact.thumbnail_url = thmbnlUrlString;

		// Insert contact information, including URLs:
		insertContactInfo(contact, (err, completeContact)=>{
			if(err) {
				callback(err);
			} else {
				console.log('Contact saved successfully!');
				callback(null, completeContact);
			}
		});
	} else {
		// No contact was retrieved from the request!
		callback('No contact was retrieved from request!' +
              ' Information not saved...');
	}
};

module.exports = {
	processContact
};
