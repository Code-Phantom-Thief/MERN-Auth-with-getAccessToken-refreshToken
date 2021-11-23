const router = require('express').Router();
const {
	register,
	login,
	logout,
	refresh_token,
	protected_resource,
} = require('../controllers/AuthController');
const { checkAuth } = require('../middleware');

router.post('/auth/register', register);
router.post('/auth/login', login);
router.delete('/auth/logout', logout);
router.post('/auth/refresh_token', refresh_token);
router.get(
	'/protected_resource',
	checkAuth,
	protected_resource
);

module.exports = router;
