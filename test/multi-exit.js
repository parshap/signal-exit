var exec = require('child_process').exec,
  t = require('tap')

var fixture = require.resolve('./fixtures/change-code.js')
var expect = require('./fixtures/change-code-expect.json')

// process.exit(code), process.exitCode = code, normal exit
var types = [ 'explicit', 'code', 'normal' ]

// initial code that is set.  Note, for 'normal' exit, there's no
// point doing these, because we just exit without modifying code
var codes = [ 0, 2, 'null' ]

// do not change, change to 5 with exit(), change to 5 with exitCode,
// change to 5 and then to 2 with exit(), change twice with exitcode
var changes = [ 'nochange', 'change', 'code', 'twice', 'twicecode']

// use signal-exit, use process.on('exit')
var handlers = [ 'sigexit', 'nosigexit' ]

var opts = []
types.forEach(function (type) {
  var testCodes = type === 'normal' ? [0] : codes
  testCodes.forEach(function (code) {
    changes.forEach(function (change) {
      handlers.forEach(function (handler) {
        opts.push([type, code, change, handler].join(' '))
      })
    })
  })
})

opts.forEach(function (opt) {
  t.test(opt, function (t) {
    var cmd = process.execPath + ' ' + fixture + ' ' + opt
    exec(cmd, function (err, stdout, stderr) {
      var res = JSON.parse(stdout)
      if (err) {
        res.actualCode = err.code
        res.actualSignal = err.signal
      } else {
        res.actualCode = 0
        res.actualSignal = null
      }
      res.stderr = stderr.trim().split('\n')
      t.same(res, expect[opt])
      t.end()
    })
  })
})
