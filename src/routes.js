const router = require('express').Router();
var path = require('path');

router.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './static/index.html'));
});

module.exports = router;
