const Token = require('./Token');

const mongoose = require('mongoose');
const { sign } = require('jsonwebtoken');

const { hash, compare } = require('bcryptjs');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } =
	process.env;

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: {
		type: String,
		required: true,
		trim: true,
		maxlength: 50,
	},
	email: {
		type: String,
		required: true,
		trim: true,
		maxlength: 200,
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			'Please provide a valid email',
		],
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 6,
		maxlength: 1000,
	},
});

UserSchema.pre('save', async function (next) {
	if (!this.isModified === 'password') {
		next();
	}
	try {
		this.password = await hash(this.password, 12);
	} catch (error) {
		next(error);
	}
});

UserSchema.methods = {
	comparePassword: async function (enteredPassword) {
		try {
			return await compare(enteredPassword, this.password);
		} catch (error) {
			console.error(error);
			return;
		}
	},
	createAccessToken: async function () {
		try {
			let { _id, username } = this;
			let accessToken = sign(
				{ user: { _id, username } },
				ACCESS_TOKEN_SECRET,
				{ expiresIn: '10m' }
			);
			return accessToken;
		} catch (error) {
			console.error(error);
			return;
		}
	},
	createRefreshToken: async function () {
		try {
			let { _id, username } = this;
			let refreshToken = sign(
				{ user: { _id, username } },
				REFRESH_TOKEN_SECRET,
				{ expiresIn: '1d' }
            );
            await new Token({ token: refreshToken }).save();
            return refreshToken;
		} catch (error) {
			console.error(error);
			return;
		}
	},
};

module.exports = mongoose.model('User', UserSchema);
