var vb = v.lib('VenusBrowserify');
var fs                = require('fs');
var concat            = require('concat-stream');
var through2 = require('through2');

describe('VenusBrowserify', function () {
  it('should transform the stream', function (done) {
    var modulePath = v.path('fixtures', 'moduleA.js');
    var stream = fs.createReadStream(modulePath);

    stream.pipe(function () {
      var buf = '';
      function transform(chunk, enc, cb) {
        buf += chunk.toString();
        cb();
      }

      function flush() {
        this.push('foo: ' + buf);
      }

      return through2(transform, flush);
    }())
    .pipe(process.stdout);

    done();
    return;

    vb(stream, { path: modulePath }).pipe(concat(function (data) {
      console.log(data.toString());
      done();
    }));
  });
});
