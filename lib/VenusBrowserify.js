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
  this.transform = this.transform.bind(this);
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
  var venus  = this.venus;

  function transform(chunk, enc, cb) {
    buffer += chunk.toString();
    cb();
  }

  function flush() {
    var data = new stream.Readable();
    var standaloneName = path.basename(filepath).split('.')[0];
    data.push(buffer);
    data.push(null);

    browserify({
      entries: [data],
      debug: true,
      standalone: standaloneName
    }).bundle(function (err, result) {
      if (err) {
        venus.error('unable to bundle', filepath);
        venus.error(err);
      } else {
        this.push(result);
        venus.debug(filepath, 'is bundled as window.' + standaloneName);
      }

      this.push(null);
    }.bind(this));
  }

  return through2(transform, flush);
};
