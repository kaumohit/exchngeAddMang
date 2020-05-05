const jwt = require('jsonwebtoken');
const winston = require('winston');
const config = require('../config/appConfig');
const errorCode = require('../config/errorCodes');


exports.verify = async (req, res, next) => {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (!token) {
		winston.error(errorCode[1]);
		return res.status(400).send({ msg: 'Something Went Wrong.(ERROR CODE: 001)' });
	} else {
		jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
			if (err) {
				winston.error(errorCode[2]);
				return res.status(400).json({ msg: 'Something Went Wrong.(ERROR CODE: 002)' });
			} else {
				next();
			}	
		});
	}
}

