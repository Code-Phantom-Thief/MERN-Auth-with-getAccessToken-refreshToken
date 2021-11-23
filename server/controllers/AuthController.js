const User = require('../models/User');
const Token = require('../models/Token');

const { verify, sign } = require('jsonwebtoken');

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } =
	process.env;

exports.register = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const existUser = await User.findOne({ email });
		if (existUser) {
			return res
				.status(400)
				.json({ message: 'Email addres already taken' });
		}

		const newUser = new User({
			username,
			email,
			password,
		});
		await newUser.save();

		let accessToken = await newUser.createAccessToken();
		let refreshToken = await newUser.createRefreshToken();

		return res
			.status(201)
			.json({ accessToken, refreshToken });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res
				.status(401)
				.json({
					message: 'Email or Password does not match',
				});
		}
		const valid = await user.comparePassword(password);
		if (!valid) {
			return res.status(401).json({
				message: 'Email or Password does not match',
			});
		}
		let accessToken = await user.createAccessToken();
		let refreshToken = await user.createRefreshToken();

		return res
			.status(201)
			.json({ accessToken, refreshToken });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.refresh_token = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(403).json({ message: "Access denied, token missing!" });
    }

    try {
        const tokenDoc = await Token.findOne({ token: refreshToken });
        if (!tokenDoc) {
            return res.status(401).json({message: 'Token expired!'})
        }

        const payload = verify(tokenDoc.token, REFRESH_TOKEN_SECRET);
        const accessToken = sign({ user: payload }, ACCESS_TOKEN_SECRET, { expiresIn: '10m' })
        return res.status(200).json({accessToken});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.logout = async (req, res) => {
    const {refreshToken} = req.body;
    try {
        await Token.findOneAndDelete({ token: refreshToken });
        return res.status(200).json({message: 'User logged out!'})
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.protected_resource = async (req, res) => {
	try {
		return res.status(200).json({ user: req.user });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};
