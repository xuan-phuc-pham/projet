const { User } = require('../../db/models');
const authService = require('../services/auth');

// Je mettre les fonctions lié aux authentifications
// Utisation de cookie httpOnly


const register = async (req, res, next) => {
  try {
    const { username, password, fname, lname } = req.body;

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Utilisateur existant' });
    }

    const user = await authService.registerUser({ username, password, fname, lname });

    const token = authService.generateToken({ userId: user.id });
    await authService.createSession(user.id, token);

    res.cookie('session_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 24 * 60 * 60 * 1000, // 24h
    });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'User pas trouve' });
    }

    const validPassword = await authService.comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Wrong mdp' });
    }

    const token = authService.generateToken({ userId: user.id });
    await authService.createSession(user.id, token);

    res.cookie('session_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const result = await authService.getUserWithPermissions(user.id);

    res.json({ success: true, data: { user: result.user, token } });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.deleteSession(req.token);
    res.clearCookie('session_token');
    res.json({ success: true, data: { message: 'Deconnecte' } });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({ success: true, data: { user: req.user, permissions: req.permissions } });
};

module.exports = { register, login, logout, me };
