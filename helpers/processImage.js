'use strict';

require('../config/config');

const path = require('path');
const os = require('os');
const fs = require('fs');

const {resizeAndSaveImage} = require ('./resizeImage');
const {uploadImage,uploadImageFromPath} = require ('./uploadImage');

/**
* Process the received contact image before saving the contact's information
* in the database.
*
* Processing implies the following steps:
*
* 1. Prepare image processing: Retrieve the image file's name and set names
*			for a temporary file that will store a copy of the image, with which
*			this function will work, and a thumbnail file, the end result of the
*			processing.
* 2. Write the image file into the filesystem's temp folder to have it at
*			hand.
* 3. Copy the file to process the image resizing with the copy.
* 4. Upload the original file to S3.
* 5. Resize the copy.
* 6. Upload the modified file to S3.
* 7. Return both files' locations in Strings.
*
* @author Alberto Pérez Romero
* @param {File} contactPicFile A File (as retrieved from an HttpRequest)
*																containing the contact's picture.
* @param {function} callback A function to be called when this one is done.
*															following tradition, if there is an error,
*															it is sent as the first parameter. Otherwise,
*															the first parameter is null, and the URLs are
*															the second and third parameters.
* @return A call to callback, providing parameters as stated above.
* @see resizeImage.js
* @see uploadImage.js
* (Both functions are called by this one).
*/
const processImage = (contactPicFile, callback) => {
	// 1. Prepare image processing...
	const contactPicFileName = contactPicFile.name;
	const thumbnailFileName = 't-'+contactPicFileName;
	const tempThumbnailFileName = 'T-'+thumbnailFileName;

	const filePath = path.join(os.tmpdir(), path.basename(contactPicFileName));
	const thumbnailPath = path.join(os.tmpdir(),
		path.basename(thumbnailFileName));
	const tempThumbnailPath = path.join(os.tmpdir(),
		path.basename(tempThumbnailFileName));

	console.log('Starting image processing with the following data:');
	console.log('file='+contactPicFile);
	console.log('fileName='+contactPicFileName);
	console.log(thumbnailFileName);
	console.log(tempThumbnailFileName);
	console.log('filePath='+filePath);
	console.log('thumbnailPath='+thumbnailPath);

	// 2. Write file into filesystem
	fs.writeFile(filePath, contactPicFile.data, (err) => {
		if(err){
			// Error writing file...
			return callback(err);
		}
		// else, file was written.
		console.log('File written!');

		// 3. Copy file for the thumbnail.
		fs.copyFile(filePath, tempThumbnailPath, (err) => {
			if(err){
				// Error copying file...
				return callback(err);
			}
			// else, file was copied.
			console.log('File copied!');

			// 4. Upload original file to S3...
			let filePrefix = (new Date().getMilliseconds())+'-'+
                        (Math.floor(Math.random()*2500))+'-';
			uploadImage(contactPicFile, process.env.S3_FULLSIZE_PREFIX,
				filePrefix, (err, data)=>{
					if(err) {
						// Error uploading image...
						return callback(err);
					}
					// Else, image was uploaded.
					console.log('Image uploaded!');

					// 5. Resize the copy:
					var width = 128;
					var height = 128;
					resizeAndSaveImage(tempThumbnailPath, width, height, thumbnailPath,
						(err, data)=>{
							if(err) {
								return callback(err);
							}
							// Else, thumbnail was written.
							console.log('Thumbnail written! To be uploaded now...');

							// 6. Upload the copy to S3...
							uploadImageFromPath(thumbnailPath, thumbnailFileName,
								process.env.S3_THUMBNAIL_PREFIX,
								filePrefix, (err, data)=>{
									if(err) {
										return callback(err);
									}
									console.log('Thumbnail uploaded!');

									// 7. Next,
									// Return file names for database storage:

									let uploadedImageFileName =  process.env.S3_BASE_URL +
                                          process.env.S3_BUCKET_NAME + '/'+
                                          process.env.S3_FULLSIZE_PREFIX +
                                          '/'+
                                          filePrefix+
                                          contactPicFileName;

									let uploadedThumbnailFileName = process.env.S3_BASE_URL +
                                            process.env.S3_BUCKET_NAME + '/'+
                                            process.env.S3_THUMBNAIL_PREFIX +
                                            '/'+
                                            filePrefix+
                                            thumbnailFileName;
									return callback(null, uploadedImageFileName,
										uploadedThumbnailFileName);
								});
						});
				});
		});
	});
};

module.exports = {
	processImage
};
