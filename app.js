const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Company X Web Application</h1><ul>' +
    '<li><a href="/feature1">Feature 1</a></li>' +
    '<li><a href="/feature2">Feature 2</a></li>' +
    '<li><a href="/feature3">Feature 3</a></li>' +
    '<li><a href="/feature4">Feature 4</a></li>' +
    '<li><a href="/feature5">Feature 5</a></li>' +
    '</ul>');
});

app.get('/feature1', (req, res) => {
  res.send('Feature 1 is working!');
});

app.get('/feature2', (req, res) => {
  res.send('Feature 2 is working!');
});

app.get('/feature3', (req, res) => {
  res.send('Feature 3 is working!');
});

app.get('/feature4', (req, res) => {
  res.send('Feature 4 is working!');
});

app.get('/feature5', (req, res) => {
  res.send('Feature 5 is working!');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = app;
