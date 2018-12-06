'use strict';

require('../config/config');

const mysql = require('mysql');
const moment = require('moment');

// Database connection pool.
let pool;

/**
* Function that sets up the database connection pool.
*
* @author Alberto Pérez Romero.
*/
const setUpConnection = () => {
	console.log('Connecting to DB in '+ process.env.NODE_ENV+ '!!');
	pool = mysql.createPool({
		connectionLimit: 50,
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		connectTimeout: 10000
	});
};

/**
* Function that retrieves the current contact list from the database.
* Results are expected as:
* 	an error with code 'ER_EMPTY_QUERY' - If there are no contacts yet.
* 	OR
* 	An array of JSON objects describing the existing contacts.
*
* Since an empty contact list is possible upon starting the app, this
* error is processed right here, and an empty array is returned.
*
* @author Alberto Pérez Romero.
* @param {function} callback A function to be invoked after this one
*															is done.
* @returns callback with an error as the first parameter, if that happens.
*							Otherwise, the same function is called with null as the first
*							parameter, and the contact list result described above, as the
*							second.
*/
const retrieveContactList = (callback) => {
	// console.log('pool=' + pool);
	const query = 'SELECT * FROM contacts';

	pool.query(query, (err, results, fields) => {
		if (err) {
			//console.log(err);
			if (err.code === 'ER_EMPTY_QUERY') {
				//console.log('Query was empty - Returning an empty array');
				return callback(null, []);
			}
			//console.log('Error executing query:');
			//console.log(err);
			return callback(err);
		}

		if (results.length === 0) {
			callback(null, []);
		} else {
			callback(null, results);
		}
	});
};

/**
* Function that inserts a new contact in the database.
*
* It then calls a SELECT query to retrieve the contact with all his or
* her information filled.
*
* This function can be optimized with a Hibernate-like module.
*
* @author Alberto Pérez Romero.
*
* @param {Contact} The Contact object to insert. A contact contains an id
*										(set by the db), a String for his or her first name,
*										another for his or her last name, another for the phone
*										number, another for the URL where his or her picture is
*										uploaded, and one more for the thumbnail's storage
*										location URL. Finally, the database version also provides
*										a timestamp with the date of addition.
* @param {function} callback A function to be invoked after this one
*															is done.
* @returns callback with an error as the first parameter, if that happens.
*							Otherwise, the same function is called with null as the first
*							parameter, and the contact as the second.
*/
const insertContactInfo = (contact, callback) => {
	const timeStamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	//console.log('timeStamp='+timeStamp);

	// Prepare the query to be executed:

	// TODO:
	// The following can be refactored on a future Sprint:
	let valuesString = '';

	let first_name_field = 'first_name,';
	let first_name = contact.first_name;
	//console.log('contact.firstName='+first_name);
	if(!first_name){
		first_name_field = '';
	} else {
		valuesString += '\''+first_name+'\',';
	}
	let last_name_field = ' last_name,';
	let last_name = contact.last_name;
	//console.log('contact.lastName='+last_name);
	if(!last_name){
		last_name_field = '';
	} else {
		valuesString += ' \''+last_name+'\',';
	}
	let phone_field = ' phone,';
	let phone = contact.phone;
	//console.log('contact.phone='+phone);
	if(!phone){
		phone_field = '';
	} else {
		valuesString += ' \''+phone+'\',';
	}
	let img_url_field = ' img_url,';
	let img_url = contact.img_url;
	//console.log('contact.imgUrl='+img_url);
	if(!img_url){
		img_url_field = '';
	} else {
		valuesString += ' \''+img_url+'\',';
	}
	let thumbnail_url_field = ' thumbnail_url,';
	let thumbnail_url = contact.thumbnail_url;
	//console.log('contact.thumbnailUrl='+thumbnail_url);
	if(!thumbnail_url){
		thumbnail_url_field = '';
	} else {
		valuesString += ' \''+thumbnail_url+'\',';
	}
	let date_added_field = 'date_added';
	let date_added = timeStamp;
	//console.log('contact.date_added='+date_added);
	//console.log('valuesString so far (without timestamp):');
	//console.log(valuesString);

	const query =
    `INSERT INTO contacts (${first_name_field}${last_name_field}${phone_field}
                            ${img_url_field}${thumbnail_url_field}
                            ${date_added_field}) VALUES (${valuesString}
                            '${date_added}');`;
	//console.log('insert query='+query);

	// Execute the query
	pool.query(query, (err, results, fields) => {
		//console.log('results:');
		//console.log(results);
		//console.log(JSON.stringify(results));
		if (err) {
			// There was an error!
			console.log('Error executing INSERT query:');
			console.log(err);
			return callback(err);
		}

		// Everything went as expected.
		let contact_id = results.insertId;
		
		// Now, retrieve the complete contact and return it.
		let completeContactQuery =
        'SELECT * FROM contacts WHERE contact_id='+ contact_id;
		pool.query(completeContactQuery, (err, results, fields)=>{
			//console.log('results of retrieval query:');
			//console.log(results);
			//console.log(JSON.stringify(results));
			if (err) {
				console.log('Error executing SELECT query:');
				console.log(err);
				return callback(err);
			}
			return callback(null, results);
		});
	});
};

module.exports = {
	setUpConnection,
	retrieveContactList,
	insertContactInfo
};
