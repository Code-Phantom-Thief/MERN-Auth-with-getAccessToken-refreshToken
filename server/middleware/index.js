const { verify } = require('jsonwebtoken');
const privateKey = process.env.ACCESS_TOKEN_SECRET;

exports.checkAuth = async (req, res, next) => {
	const token = req.get('x-auth-token');

	if (!token) {
		return res.status(401).json({
			message: 'Access denied, token missing!',
		});
	}

	try {
		const payload = verify(token, privateKey);
		req.user = payload.user;
		next();
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				message: 'Session timed out,please login again',
			});
		} else if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				message: 'Invalid token,please login again!',
			});
		} else {
			console.error(error);
			return res
				.status(400)
				.json({ message: error.message });
		}
	}
};
