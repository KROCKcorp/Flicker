const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api/key', (req, res) => {
  fs.readFile(
    path.join(__dirname, 'public', 'keys.json'),
    'utf8',
    (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Couldn't get the api key" });
      }
      const keyData = JSON.parse(data);
      res.send(keyData['API-Read-Access-Token']);
    }
  );
});

app.listen(3200, () => {
  console.log('Flicker Up!');
});
