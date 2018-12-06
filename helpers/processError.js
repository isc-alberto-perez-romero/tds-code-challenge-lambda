'use strict';

/**
* Whenever an error happens, format the response and send it in JSON format.
*
* @author Alberto Pérez Romero
* @param {error} err The error object that caused the problem.
* @param {String} errorMessage A String detailing the error.
* @param {HttpResponse} The response object on which the error report will be
*													written.
*/
const processError = (err, errorMessage, response) => {
	console.log(errorMessage);
	console.log(err);
	return response.status(500).json({
		ok: false,
		message: errorMessage,
		err: err
	});
};

module.exports = {
	processError
};
