'use strict';

require('../config/config');

const AWS = require('aws-sdk');
const fs = require('fs');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const IAM_USER_KEY = process.env.IAM_USER_KEY;
const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

/**
* Function that uploads an image into Amazon S3.
*
* This function receives a file object (as received from an HttpRequest),
* creates an S3 Bucket, and uploads the file with public read access.
*
* @author Alberto Pérez Romero.
* @param {File} file The file to be uploaded.
* @param {string} typePrefix A string indicating the folder name where the
*															image will be stored.
* @param {string} filePrefix A string with a generated prefix that is intended
*															to make up for common, or repeated, file names,
*															so that this image's name will stay unique
*															enough.
* @param {function} callback A function to be called once the upload is done.
* @returns The callback function with null as the first parameter, and the
*						result of the S3 upload method, as the second. Or, if
*						an error happens, the callback receives the error as the first
*						parameter.
*/
const uploadImage = (file, typePrefix, filePrefix, callback) =>{
	console.log('Starting image upload to bucket:'+BUCKET_NAME);
	// Generate the key for this file:
	let fileKey = typePrefix+'/'+filePrefix+file.name;
	console.log('fileKey will be:'+fileKey);

	// Create the S3 bucket access:
	let s3Bucket = new AWS.S3({
		accessKeyId: IAM_USER_KEY,
		secretAccessKey: IAM_USER_SECRET,
		Bucket: BUCKET_NAME,
	});
	console.log('s3Bucket constructor finished...');

	// Create the bucket itself:
	s3Bucket.createBucket(() => {
		let params = {
			Bucket: BUCKET_NAME,
			Key: fileKey,
			Body: file.data,
			ACL: 'public-read',
		};
		console.log('Bucket created');

		// Upload the file:
		s3Bucket.upload(params, (err, data)=>{
			if(err){
				// An error happened!
				console.log('Error upon uploading image');
				console.log(err);
				return callback(err);
			}

			//Everything went as expected.
			console.log('File uploaded to S3!');
			return callback(null, data);
		});
	});
};

/**
* Function that uploads an image into Amazon S3.
*
* Unlike uploadImage(), this function doesn't receive a File object but
* rather, its filesystem path as a string.
*
* The function creates an S3 Bucket, and uploads the file with public
* read access.
*
* @author Alberto Pérez Romero.
* @param {string} filePath The file to be uploaded's location.
* @param {string} fileName The file to be uploaded's name.
* @param {string} typePrefix A string indicating the folder name where the
*															image will be stored.
* @param {string} filePrefix A string with a generated prefix that is intended
*															to make up for common, or repeated, file names,
*															so that this image's name will stay unique
*															enough.
* @param {function} callback A function to be called once the upload is done.
* @returns The callback function with null as the first parameter, and the
*						result of the S3 upload method, as the second. Or, if
*						an error happens, the callback receives the error as the first
*						parameter.
*/
const uploadImageFromPath = (filePath, fileName, typePrefix,
	filePrefix, callback) =>{

	console.log('BUCKET_NAME='+BUCKET_NAME);

	// Generate the key for this file:
	let fileKey = typePrefix+'/'+filePrefix+fileName;

	// Create the S3 bucket access:
	let s3Bucket = new AWS.S3({
		accessKeyId: IAM_USER_KEY,
		secretAccessKey: IAM_USER_SECRET,
		Bucket: BUCKET_NAME,
	});
	console.log('s3Bucket constructor finished...');

	// Create the bucket itself:
	s3Bucket.createBucket(() => {
		let params = {
			Bucket: BUCKET_NAME,
			Key: fileKey,
			Body: fs.readFileSync(filePath),
			ACL: 'public-read',
		};
		console.log('Bucket created');

		// Upload the file:
		s3Bucket.upload(params, (err, data)=>{
			if(err){
				// An error happened!
				console.log('Error upon uploading image');
				console.log(err);
				return callback(err);
			}

			//Everything went as expected.
			console.log('File uploaded to S3!');
			return callback(null, data);
		});
	});
};

module.exports = {
	uploadImage,
	uploadImageFromPath
};
