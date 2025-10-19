import express from 'express';

const app = express();

app.listen(5001, () => {
  console.log('Server is running on http://localhost:5001');
});

app.get('/api/map', (req, res) => {
  res.json({ message: 'Map data endpoint' });
});