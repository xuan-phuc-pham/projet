const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ message: 'List posts route not implemented yet' });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Get post ${id} route not implemented yet` });
});

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Create post route not implemented yet' });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Replace post ${id} route not implemented yet` });
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Update post ${id} route not implemented yet` });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.status(501).json({ message: `Delete post ${id} route not implemented yet` });
});

module.exports = router;
