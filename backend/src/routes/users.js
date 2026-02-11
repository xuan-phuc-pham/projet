const express = require('express');

const router = express.Router();

// GET /users - list users
router.get('/', (req, res) => {
  // TODO: implement users listing
  res.status(501).json({ message: 'List users route not implemented yet' });
});

// GET /users/me - current user profile
router.get('/me', (req, res) => {
  res.status(501).json({ message: 'Get current user route not implemented yet' });
});

// POST /users - create a user
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create user route not implemented yet' });
});

// GET /users/:id - get a single user
router.get('/:id', (req, res) => {
  const { id } = req.params;
  // TODO: implement single user retrieval
  res.status(501).json({ message: `Get user ${id} route not implemented yet` });
});

// PUT /users/:id - replace a user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Replace user ${id} route not implemented yet` });
});

// PATCH /users/:id - update a user
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Update user ${id} route not implemented yet` });
});

// DELETE /users/:id - delete a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Delete user ${id} route not implemented yet` });
});

module.exports = router;
