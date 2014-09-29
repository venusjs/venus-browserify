var browserify = require('browserify');
var stream = require('stream');
var through2 = require('through2');
var path = require('path');

module.exports = VenusBrowserify;

/**
 * @constructor
 */
function VenusBrowserify(venus) {
  this.venus = venus;
}

/**
 * @property name
 */
VenusBrowserify.prototype.name = 'venus-browserify';

/**
 * Attach
 */
VenusBrowserify.prototype.attach = function () {
  this.venus.plugins['venus-unit'].registerTransform('venus-browserify', this.transform);
};

/**
 * Transformation function
 */
VenusBrowserify.prototype.transform = function (filepath) {
  var buffer = '';

  function transform(chunk, enc, cb) {
    buffer += chunk.toString();
    cb();
  }

  function flush() {
    var data = new stream.Readable();
    data.push(buffer);
    data.push(null);

    browserify({
      entries: [data],
      debug: true,
      standalone: path.basename(filepath).split('.')[0]
    }).bundle(function (err, result) {
      if (err) {
        console.err(err);
      } else {
        this.push(result);
      }

      this.push(null);
    }.bind(this));
  }

  return through2(transform, flush);
};
