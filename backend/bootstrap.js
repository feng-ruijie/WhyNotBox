// bootstrap.js
const { Bootstrap } = require("@midwayjs/bootstrap");

Bootstrap.configure({
  imports: require('./server.js'),
  moduleDetector: false
}).run();