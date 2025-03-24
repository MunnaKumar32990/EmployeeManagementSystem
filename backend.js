const express = require('express');
const app = express();
app.use(express.json());

let dataStore = {}; // Replace with your actual data storage solution (e.g., database)

// Endpoint to handle data storage
app.post('/api/data', (req, res) => {
  const { key, value } = req.body;
  dataStore[key] = value;
  res.status(200).send({ message: 'Data stored successfully' });
});

// Endpoint to retrieve data
app.get('/api/data/:key', (req, res) => {
  const key = req.params.key;
  const value = dataStore[key];
  if (value) {
    res.status(200).send({ key, value });
  } else {
    res.status(404).send({ message: 'Data not found' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
