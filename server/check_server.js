const http = require('http');
http.get('http://localhost:3000', (res) => {
  res.setEncoding('utf8');
  res.on('data', (chunk) => console.log(chunk));
}).on('error', (e) => console.error(e.message));
