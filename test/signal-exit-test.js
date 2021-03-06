/* global describe, it */

var exec = require('child_process').exec,
  expect = require('chai').expect,
  assert = require('assert'),
  shell = process.platform === 'win32' ? null : { shell: '/bin/bash' }

require('chai').should()
require('tap').mochaGlobals()

describe('signal-exit', function () {

  it('receives an exit event when a process exits normally', function (done) {
    exec(process.execPath + ' ./test/fixtures/end-of-execution.js', shell, function (err, stdout, stderr) {
      expect(err).to.equal(null)
      stdout.should.match(/reached end of execution, 0, null/)
      done()
    })
  })

  it('receives an exit event when a process is terminated with sigint', function (done) {
    exec(process.execPath + ' ./test/fixtures/sigint.js', shell, function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/exited with sigint, null, SIGINT/)
      done()
    })
  })

  it('receives an exit event when a process is terminated with sigterm', function (done) {
    exec(process.execPath + ' ./test/fixtures/sigterm.js', shell, function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/exited with sigterm, null, SIGTERM/)
      done()
    })
  })

  it('receives an exit event when process.exit() is called', function (done) {
    exec(process.execPath + ' ./test/fixtures/exit.js', shell, function (err, stdout, stderr) {
      err.code.should.equal(32)
      stdout.should.match(/exited with process\.exit\(\), 32, null/)
      done()
    })
  })

  it('does not exit if user handles signal', function (done) {
    exec(process.execPath + ' ./test/fixtures/signal-listener.js', shell, function (err, stdout, stderr) {
      assert(err)
      assert.equal(stdout, 'exited calledListener=4, code=null, signal="SIGHUP"\n')
      done()
    })
  })

  it('ensures that if alwaysLast=true, the handler is run last (signal)', function (done) {
    exec(process.execPath + ' ./test/fixtures/signal-last.js', shell, function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/first counter=1/)
      stdout.should.match(/last counter=2/)
      done()
    })
  })

  it('ensures that if alwaysLast=true, the handler is run last (normal exit)', function (done) {
    exec(process.execPath + ' ./test/fixtures/exit-last.js', shell, function (err, stdout, stderr) {
      assert.ifError(err)
      stdout.should.match(/first counter=1/)
      stdout.should.match(/last counter=2/)
      done()
    })
  })

  it('works when loaded multiple times', function (done) {
    exec(process.execPath + ' ./test/fixtures/multiple-load.js', shell, function (err, stdout, stderr) {
      assert(err)
      stdout.should.match(/first counter=1, code=null, signal="SIGHUP"/)
      stdout.should.match(/first counter=2, code=null, signal="SIGHUP"/)
      stdout.should.match(/last counter=3, code=null, signal="SIGHUP"/)
      stdout.should.match(/last counter=4, code=null, signal="SIGHUP"/)
      done()
    })
  })

  // TODO: test on a few non-OSX machines.
  it('removes handlers when fully unwrapped', function (done) {
    exec(process.execPath + ' ./test/fixtures/unwrap.js', shell, function (err, stdout, stderr) {
      assert(err)
      err.signal.should.equal('SIGHUP')
      expect(err.code).to.equal(null)
      done()
    })
  })

  it('does not load() or unload() more than once', function (done) {
    exec(process.execPath + ' ./test/fixtures/load-unload.js', shell, function (err, stdout, stderr) {
      assert.ifError(err)
      done()
    })
  })

  it('handles uncatchable signals with grace and poise', function (done) {
    exec(process.execPath + ' ./test/fixtures/sigkill.js', shell, function (err, stdout, stderr) {
      assert.ifError(err)
      done()
    })
  })
})
