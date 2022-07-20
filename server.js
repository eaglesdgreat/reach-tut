const express = require('express');

const app = express();

app.use('/static', express.static('build'));

app.listen(9090);
