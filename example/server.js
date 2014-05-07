var express = require('express'),
    app = express(),
    port = 3020;

app.use(express.static('../'));

app.listen(port, function() {
    console.log('ng-pdfviewer example listening on port '+port);
});