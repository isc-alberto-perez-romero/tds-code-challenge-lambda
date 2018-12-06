'use strict';

const sharp = require ('sharp');

/**
* Function that resizes an image and saves it into a file.
*
* This makes use of the sharp module, which is platform-dependent. A Linux
* version was used in this project because the servers and Lambda function
* that will host this service are expected to be (or behave like) Linux
* machines.
*
* @author Alberto Pérez Romero.
* @param {string} srcPath The image path for the file to be resized.
* @param {number} width The width at which the image will be resized.
* @param {number} height The height at which the image will be resized.
* @param {string} dstPath The destination path where the resized image will
*														be saved.
* @param {function} callback A function to be called once the resizing is done.
* @returns The callback function with null as the first parameter, and the
*						resized image's path location as a String, as the second. Or, if
*						an error happens, the callback receives the error as the first
*						parameter.
*/
const resizeAndSaveImage = (srcPath, width, height, dstPath, callback) => {
	sharp(srcPath)
		.resize(width, height)
		.toFile(dstPath, (err)=>{
			if(err){
				callback(err);
			}
			console.log('Image resized!');
			return callback(null, dstPath);
		});
};

module.exports = {
	resizeAndSaveImage
};
