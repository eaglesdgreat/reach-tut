(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Bundle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Alice = Alice;
exports.Bob = Bob;
exports._backendVersion = exports._Participants = exports._Connectors = exports._APIs = void 0;
exports._getEvents = _getEvents;
exports._getMaps = _getMaps;
exports._getViews = _getViews;
exports._versionHash = exports._version = exports._stateSourceMap = void 0;
exports.getExports = getExports;
// Automatically generated with Reach 0.1.11 (a9f7613d)

/* eslint-disable */
const _version = '0.1.11';
exports._version = _version;
const _versionHash = '0.1.11 (a9f7613d)';
exports._versionHash = _versionHash;
const _backendVersion = 17;
exports._backendVersion = _backendVersion;

function getExports(s) {
  const stdlib = s.reachStdlib;
  return {};
}

;

function _getEvents(s) {
  const stdlib = s.reachStdlib;
  return {};
}

;

function _getViews(s, viewlib) {
  const stdlib = s.reachStdlib;
  const ctc0 = stdlib.T_Address;
  const ctc1 = stdlib.T_UInt;
  const ctc2 = stdlib.T_Digest;
  return {
    infos: {},
    views: {
      1: [ctc0, ctc1, ctc2],
      2: [ctc0, ctc1, ctc2, ctc0, ctc1]
    }
  };
}

;

function _getMaps(s) {
  const stdlib = s.reachStdlib;
  const ctc0 = stdlib.T_Tuple([]);
  return {
    mapDataTy: ctc0
  };
}

;

async function Alice(ctcTop, interact) {
  if (typeof ctcTop !== 'object' || ctcTop._initialize === undefined) {
    return Promise.reject(new Error(`The backend for Alice expects to receive a contract as its first argument.`));
  }

  if (typeof interact !== 'object') {
    return Promise.reject(new Error(`The backend for Alice expects to receive an interact object as its second argument.`));
  }

  const ctc = ctcTop._initialize();

  const stdlib = ctc.stdlib;
  const ctc0 = stdlib.T_UInt;
  const ctc1 = stdlib.T_Tuple([ctc0, ctc0]);
  const ctc2 = stdlib.T_Digest;
  const ctc3 = stdlib.T_Null;
  const ctc4 = stdlib.T_Address;
  const v137 = stdlib.protect(ctc0, interact.wager, 'for Alice\'s interact field wager');
  const v140 = stdlib.protect(ctc0, await interact.getHand(), {
    at: './index.rsh:39:40:application',
    fs: ['at ./index.rsh:37:13:application call to [unknown function] (defined at: ./index.rsh:37:17:function exp)'],
    msg: 'getHand',
    who: 'Alice'
  });
  const v141 = stdlib.protect(ctc0, await interact.random(), {
    at: 'reach standard library:64:31:application',
    fs: ['at ./index.rsh:40:54:application call to "makeCommitment" (defined at: reach standard library:63:8:function exp)', 'at ./index.rsh:37:13:application call to [unknown function] (defined at: ./index.rsh:37:17:function exp)'],
    msg: 'random',
    who: 'Alice'
  });
  const v142 = stdlib.digest(ctc1, [v141, v140]);
  const txn1 = await ctc.sendrecv({
    args: [v137, v142],
    evt_cnt: 2,
    funcNum: 0,
    lct: stdlib.checkedBigNumberify('./index.rsh:43:9:dot', stdlib.UInt_max, '0'),
    onlyIf: true,
    out_tys: [ctc0, ctc2],
    pay: [v137, []],
    sim_p: async txn1 => {
      const sim_r = {
        txns: [],
        mapRefs: [],
        maps: []
      };
      let sim_txn_ctr = stdlib.UInt_max;

      const getSimTokCtr = () => {
        sim_txn_ctr = sim_txn_ctr.sub(1);
        return sim_txn_ctr;
      };

      const {
        data: [v145, v146],
        secs: v148,
        time: v147,
        didSend: v60,
        from: v144
      } = txn1;
      sim_r.txns.push({
        amt: v145,
        kind: 'to',
        tok: undefined
        /* Nothing */

      });
      sim_r.isHalt = false;
      return sim_r;
    },
    soloSend: true,
    timeoutAt: undefined
    /* mto */
    ,
    tys: [ctc0, ctc2],
    waitIfNotPresent: false
  });
  const {
    data: [v145, v146],
    secs: v148,
    time: v147,
    didSend: v60,
    from: v144
  } = txn1;
  ;
  const txn2 = await ctc.recv({
    didSend: false,
    evt_cnt: 1,
    funcNum: 1,
    out_tys: [ctc0],
    timeoutAt: undefined
    /* mto */
    ,
    waitIfNotPresent: false
  });
  const {
    data: [v155],
    secs: v157,
    time: v156,
    didSend: v71,
    from: v154
  } = txn2;
  ;
  const txn3 = await ctc.sendrecv({
    args: [v144, v145, v146, v154, v155, v141, v140],
    evt_cnt: 2,
    funcNum: 2,
    lct: v156,
    onlyIf: true,
    out_tys: [ctc0, ctc0],
    pay: [stdlib.checkedBigNumberify('./index.rsh:60:9:decimal', stdlib.UInt_max, '0'), []],
    sim_p: async txn3 => {
      const sim_r = {
        txns: [],
        mapRefs: [],
        maps: []
      };
      let sim_txn_ctr = stdlib.UInt_max;

      const getSimTokCtr = () => {
        sim_txn_ctr = sim_txn_ctr.sub(1);
        return sim_txn_ctr;
      };

      const {
        data: [v163, v164],
        secs: v166,
        time: v165,
        didSend: v81,
        from: v162
      } = txn3;
      ;
      const v170 = stdlib.sub(stdlib.checkedBigNumberify('./index.rsh:7:18:decimal', stdlib.UInt_max, '4'), v155);
      const v171 = stdlib.add(v164, v170);
      const v172 = stdlib.mod(v171, stdlib.checkedBigNumberify('./index.rsh:7:34:decimal', stdlib.UInt_max, '3'));
      const v173 = stdlib.eq(v172, stdlib.checkedBigNumberify('./index.rsh:makeEnum', stdlib.UInt_max, '2'));
      const v174 = stdlib.eq(v172, stdlib.checkedBigNumberify('./index.rsh:makeEnum', stdlib.UInt_max, '0'));
      const v175 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '0'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '2')];
      const v176 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '1'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '1')];
      const v177 = v174 ? v175 : v176;
      const v178 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '2'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '0')];
      const v179 = v173 ? v178 : v177;
      const v180 = v179[stdlib.checkedBigNumberify('./index.rsh:64:9:array', stdlib.UInt_max, '0')];
      const v181 = v179[stdlib.checkedBigNumberify('./index.rsh:64:9:array', stdlib.UInt_max, '1')];
      const v182 = stdlib.mul(v180, v145);
      sim_r.txns.push({
        kind: 'from',
        to: v144,
        tok: undefined
        /* Nothing */

      });
      const v187 = stdlib.mul(v181, v145);
      sim_r.txns.push({
        kind: 'from',
        to: v154,
        tok: undefined
        /* Nothing */

      });
      sim_r.txns.push({
        kind: 'halt',
        tok: undefined
        /* Nothing */

      });
      sim_r.isHalt = true;
      return sim_r;
    },
    soloSend: true,
    timeoutAt: undefined
    /* mto */
    ,
    tys: [ctc4, ctc0, ctc2, ctc4, ctc0, ctc0, ctc0],
    waitIfNotPresent: false
  });
  const {
    data: [v163, v164],
    secs: v166,
    time: v165,
    didSend: v81,
    from: v162
  } = txn3;
  ;
  const v167 = stdlib.addressEq(v144, v162);
  stdlib.assert(v167, {
    at: './index.rsh:60:9:dot',
    fs: [],
    msg: 'sender correct',
    who: 'Alice'
  });
  const v168 = stdlib.digest(ctc1, [v163, v164]);
  const v169 = stdlib.digestEq(v146, v168);
  stdlib.assert(v169, {
    at: 'reach standard library:69:17:application',
    fs: ['at ./index.rsh:61:18:application call to "checkCommitment" (defined at: reach standard library:68:8:function exp)'],
    msg: null,
    who: 'Alice'
  });
  const v170 = stdlib.sub(stdlib.checkedBigNumberify('./index.rsh:7:18:decimal', stdlib.UInt_max, '4'), v155);
  const v171 = stdlib.add(v164, v170);
  const v172 = stdlib.mod(v171, stdlib.checkedBigNumberify('./index.rsh:7:34:decimal', stdlib.UInt_max, '3'));
  const v173 = stdlib.eq(v172, stdlib.checkedBigNumberify('./index.rsh:makeEnum', stdlib.UInt_max, '2'));
  const v174 = stdlib.eq(v172, stdlib.checkedBigNumberify('./index.rsh:makeEnum', stdlib.UInt_max, '0'));
  const v175 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '0'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '2')];
  const v176 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '1'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '1')];
  const v177 = v174 ? v175 : v176;
  const v178 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '2'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '0')];
  const v179 = v173 ? v178 : v177;
  const v180 = v179[stdlib.checkedBigNumberify('./index.rsh:64:9:array', stdlib.UInt_max, '0')];
  const v181 = v179[stdlib.checkedBigNumberify('./index.rsh:64:9:array', stdlib.UInt_max, '1')];
  const v182 = stdlib.mul(v180, v145);
  ;
  const v187 = stdlib.mul(v181, v145);
  ;
  stdlib.protect(ctc3, await interact.seeOutCome(v172), {
    at: './index.rsh:73:24:application',
    fs: ['at ./index.rsh:72:7:application call to [unknown function] (defined at: ./index.rsh:72:25:function exp)'],
    msg: 'seeOutCome',
    who: 'Alice'
  });
  return;
}

;

async function Bob(ctcTop, interact) {
  if (typeof ctcTop !== 'object' || ctcTop._initialize === undefined) {
    return Promise.reject(new Error(`The backend for Bob expects to receive a contract as its first argument.`));
  }

  if (typeof interact !== 'object') {
    return Promise.reject(new Error(`The backend for Bob expects to receive an interact object as its second argument.`));
  }

  const ctc = ctcTop._initialize();

  const stdlib = ctc.stdlib;
  const ctc0 = stdlib.T_UInt;
  const ctc1 = stdlib.T_Digest;
  const ctc2 = stdlib.T_Null;
  const ctc3 = stdlib.T_Tuple([ctc0, ctc0]);
  const ctc4 = stdlib.T_Address;
  const txn1 = await ctc.recv({
    didSend: false,
    evt_cnt: 2,
    funcNum: 0,
    out_tys: [ctc0, ctc1],
    timeoutAt: undefined
    /* mto */
    ,
    waitIfNotPresent: false
  });
  const {
    data: [v145, v146],
    secs: v148,
    time: v147,
    didSend: v60,
    from: v144
  } = txn1;
  ;
  stdlib.protect(ctc2, await interact.acceptWager(v145), {
    at: './index.rsh:49:25:application',
    fs: ['at ./index.rsh:48:11:application call to [unknown function] (defined at: ./index.rsh:48:15:function exp)'],
    msg: 'acceptWager',
    who: 'Bob'
  });
  const v153 = stdlib.protect(ctc0, await interact.getHand(), {
    at: './index.rsh:50:48:application',
    fs: ['at ./index.rsh:48:11:application call to [unknown function] (defined at: ./index.rsh:48:15:function exp)'],
    msg: 'getHand',
    who: 'Bob'
  });
  const txn2 = await ctc.sendrecv({
    args: [v144, v145, v146, v153],
    evt_cnt: 1,
    funcNum: 1,
    lct: v147,
    onlyIf: true,
    out_tys: [ctc0],
    pay: [v145, []],
    sim_p: async txn2 => {
      const sim_r = {
        txns: [],
        mapRefs: [],
        maps: []
      };
      let sim_txn_ctr = stdlib.UInt_max;

      const getSimTokCtr = () => {
        sim_txn_ctr = sim_txn_ctr.sub(1);
        return sim_txn_ctr;
      };

      const {
        data: [v155],
        secs: v157,
        time: v156,
        didSend: v71,
        from: v154
      } = txn2;
      sim_r.txns.push({
        amt: v145,
        kind: 'to',
        tok: undefined
        /* Nothing */

      });
      sim_r.isHalt = false;
      return sim_r;
    },
    soloSend: true,
    timeoutAt: undefined
    /* mto */
    ,
    tys: [ctc4, ctc0, ctc1, ctc0],
    waitIfNotPresent: false
  });
  const {
    data: [v155],
    secs: v157,
    time: v156,
    didSend: v71,
    from: v154
  } = txn2;
  ;
  const txn3 = await ctc.recv({
    didSend: false,
    evt_cnt: 2,
    funcNum: 2,
    out_tys: [ctc0, ctc0],
    timeoutAt: undefined
    /* mto */
    ,
    waitIfNotPresent: false
  });
  const {
    data: [v163, v164],
    secs: v166,
    time: v165,
    didSend: v81,
    from: v162
  } = txn3;
  ;
  const v167 = stdlib.addressEq(v144, v162);
  stdlib.assert(v167, {
    at: './index.rsh:60:9:dot',
    fs: [],
    msg: 'sender correct',
    who: 'Bob'
  });
  const v168 = stdlib.digest(ctc3, [v163, v164]);
  const v169 = stdlib.digestEq(v146, v168);
  stdlib.assert(v169, {
    at: 'reach standard library:69:17:application',
    fs: ['at ./index.rsh:61:18:application call to "checkCommitment" (defined at: reach standard library:68:8:function exp)'],
    msg: null,
    who: 'Bob'
  });
  const v170 = stdlib.sub(stdlib.checkedBigNumberify('./index.rsh:7:18:decimal', stdlib.UInt_max, '4'), v155);
  const v171 = stdlib.add(v164, v170);
  const v172 = stdlib.mod(v171, stdlib.checkedBigNumberify('./index.rsh:7:34:decimal', stdlib.UInt_max, '3'));
  const v173 = stdlib.eq(v172, stdlib.checkedBigNumberify('./index.rsh:makeEnum', stdlib.UInt_max, '2'));
  const v174 = stdlib.eq(v172, stdlib.checkedBigNumberify('./index.rsh:makeEnum', stdlib.UInt_max, '0'));
  const v175 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '0'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '2')];
  const v176 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '1'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '1')];
  const v177 = v174 ? v175 : v176;
  const v178 = [stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '2'), stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, '0')];
  const v179 = v173 ? v178 : v177;
  const v180 = v179[stdlib.checkedBigNumberify('./index.rsh:64:9:array', stdlib.UInt_max, '0')];
  const v181 = v179[stdlib.checkedBigNumberify('./index.rsh:64:9:array', stdlib.UInt_max, '1')];
  const v182 = stdlib.mul(v180, v145);
  ;
  const v187 = stdlib.mul(v181, v145);
  ;
  stdlib.protect(ctc2, await interact.seeOutCome(v172), {
    at: './index.rsh:73:24:application',
    fs: ['at ./index.rsh:72:7:application call to [unknown function] (defined at: ./index.rsh:72:25:function exp)'],
    msg: 'seeOutCome',
    who: 'Bob'
  });
  return;
}

;
const _ALGO = {
  ABI: {
    impure: [],
    pure: [],
    sigs: []
  },
  appApproval: `BiAFAAECCCAmAgEAACI1ADEYQQIKKWRJIls1ASVbNQI2GgAXSUEAByI1BCM1BgA2GgIXNQQ2GgM2GgEXSSMMQAE6SSQMQADVJBJEJDQBEkQ0BEkiEkw0AhIRRChkSTUDSVcAIDX/IQRbNf5JNQVJIls1/SVbNfyABPMtCgw0/RZQNPwWULA0/zEAEkQ0A1coIDT9FjT8FlABEkQ0/IEENAOBaFsJCIEDGDX7gBAAAAAAAAAAAQAAAAAAAAABgBAAAAAAAAAAAAAAAAAAAAACNPsiEk2AEAAAAAAAAAACAAAAAAAAAAA0+yQSTTX6sSKyATT6Ils0/guyCCOyEDT/sgezsSKyATT6JVs0/guyCCOyEDQDV0ggsgezQgCySCM0ARJENARJIhJMNAISEUQoZEk1A0lJVwAgNf8hBFs1/lcoIDX9STUFFzX8gATVFRkUNPwWULA0/ogA4jT/NP4WUDT9UDEAUDT8FlAoSwFXAHBnSCQ1ATIGNQJCAG9IgaCNBogAuCI0ARJENARJIhJMNAISEURJNQVJIls1/1cIIDX+gAS03vNWNP8WUDT+ULA0/4gAiDEANP8WUDT+UChLAVcASGdIIzUBMgY1AkIAHDEZgQUSRLEisgEisggjshAyCbIJMgqyB7NCAAUxGSISRCk0ARY0AhZQZzQGQQAKgAQVH3x1NAdQsDQASSMIMgQSRDEWEkQjQzEZIhJEQv/fIjE0EkQkMTUSRCIxNhJEIjE3EkQiNQEiNQJC/680AElKIwg1ADgHMgoSRDgQIxJEOAgSRIk=`,
  appClear: `Bg==`,
  companionInfo: null,
  extraPages: 0,
  mapDataKeys: 0,
  mapDataSize: 0,
  stateKeys: 1,
  stateSize: 112,
  unsupported: [],
  version: 10,
  warnings: []
};
const _ETH = {
  ABI: `[
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "v145",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "v146",
                "type": "uint256"
              }
            ],
            "internalType": "struct T1",
            "name": "msg",
            "type": "tuple"
          }
        ],
        "internalType": "struct T2",
        "name": "_a",
        "type": "tuple"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "msg",
        "type": "uint256"
      }
    ],
    "name": "ReachError",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_who",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "v145",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "v146",
                "type": "uint256"
              }
            ],
            "internalType": "struct T1",
            "name": "msg",
            "type": "tuple"
          }
        ],
        "indexed": false,
        "internalType": "struct T2",
        "name": "_a",
        "type": "tuple"
      }
    ],
    "name": "_reach_e0",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_who",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "v155",
                "type": "uint256"
              }
            ],
            "internalType": "struct T4",
            "name": "msg",
            "type": "tuple"
          }
        ],
        "indexed": false,
        "internalType": "struct T5",
        "name": "_a",
        "type": "tuple"
      }
    ],
    "name": "_reach_e1",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_who",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "v163",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "v164",
                "type": "uint256"
              }
            ],
            "internalType": "struct T7",
            "name": "msg",
            "type": "tuple"
          }
        ],
        "indexed": false,
        "internalType": "struct T8",
        "name": "_a",
        "type": "tuple"
      }
    ],
    "name": "_reach_e2",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "_reachCreationTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_reachCurrentState",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_reachCurrentTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "v155",
                "type": "uint256"
              }
            ],
            "internalType": "struct T4",
            "name": "msg",
            "type": "tuple"
          }
        ],
        "internalType": "struct T5",
        "name": "_a",
        "type": "tuple"
      }
    ],
    "name": "_reach_m1",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "time",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "v163",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "v164",
                "type": "uint256"
              }
            ],
            "internalType": "struct T7",
            "name": "msg",
            "type": "tuple"
          }
        ],
        "internalType": "struct T8",
        "name": "_a",
        "type": "tuple"
      }
    ],
    "name": "_reach_m2",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]`,
  Bytecode: `0x608060405260405162000d7538038062000d75833981016040819052620000269162000235565b6000805543600355604080513381528251602080830191909152808401518051838501520151606082015290517fa736757a943474ef5983bb0422ab3a1e64bcd39e99635f4430c7765118231f959181900360800190a16020810151516200009290341460076200012e565b620000c0604051806060016040528060006001600160a01b0316815260200160008152602001600081525090565b338082526020838101805151828501908152905182015160408086019182526001600081905543905580518085019590955291518483015251606080850191909152815180850390910181526080909301905281516200012592600292019062000158565b505050620002d2565b81620001545760405163100960cb60e01b81526004810182905260240160405180910390fd5b5050565b828054620001669062000295565b90600052602060002090601f0160209004810192826200018a5760008555620001d5565b82601f10620001a557805160ff1916838001178555620001d5565b82800160010185558215620001d5579182015b82811115620001d5578251825591602001919060010190620001b8565b50620001e3929150620001e7565b5090565b5b80821115620001e35760008155600101620001e8565b604080519081016001600160401b03811182821017156200022f57634e487b7160e01b600052604160045260246000fd5b60405290565b600081830360608112156200024957600080fd5b62000253620001fe565b835181526040601f19830112156200026a57600080fd5b62000274620001fe565b60208581015182526040909501518582015293810193909352509092915050565b600181811c90821680620002aa57607f821691505b60208210811415620002cc57634e487b7160e01b600052602260045260246000fd5b50919050565b610a9380620002e26000396000f3fe60806040526004361061004b5760003560e01c80631e93b0f1146100545780638323075714610078578063873779a11461008d5780639014596a146100a0578063ab53f2c6146100b357005b3661005257005b005b34801561006057600080fd5b506003545b6040519081526020015b60405180910390f35b34801561008457600080fd5b50600154610065565b61005261009b366004610806565b6100d6565b6100526100ae36600461081e565b6102ef565b3480156100bf57600080fd5b506100c86105d0565b60405161006f929190610830565b6100e6600160005414600961066d565b610100813515806100f957506001548235145b600a61066d565b6000808055600280546101129061088d565b80601f016020809104026020016040519081016040528092919081815260200182805461013e9061088d565b801561018b5780601f106101605761010080835404028352916020019161018b565b820191906000526020600020905b81548152906001019060200180831161016e57829003601f168201915b50505050508060200190518101906101a391906108de565b6040805133815284356020808301919091528501358183015290519192507f3957da95a08a7316b724c4fe20ec058158ff5f626860362a6b6aafcb999f7225919081900360600190a16101fd81602001513414600861066d565b6102416040518060a0016040528060006001600160a01b03168152602001600081526020016000815260200160006001600160a01b03168152602001600081525090565b81516001600160a01b031681526020808301518183015260408084015181840152336060840152848201356080840152600260005543600155516102c59183910181516001600160a01b0390811682526020808401519083015260408084015190830152606080840151909116908201526080918201519181019190915260a00190565b604051602081830303815290604052600290805190602001906102e9929190610696565b50505050565b6102ff600260005414600e61066d565b6103198135158061031257506001548235145b600f61066d565b60008080556002805461032b9061088d565b80601f01602080910402602001604051908101604052809291908181526020018280546103579061088d565b80156103a45780601f10610379576101008083540402835291602001916103a4565b820191906000526020600020905b81548152906001019060200180831161038757829003601f168201915b50505050508060200190518101906103bc919061094d565b90506103c661071a565b604080513381528435602080830191909152850135818301529084013560608201527feade97c60783e4c8b7590ebdcad0dcf3d731471c98f3f06328d9701c9d0e19699060800160405180910390a16104213415600b61066d565b8151610439906001600160a01b03163314600c61066d565b604080516104859161045f91602080880135928801359101918252602082015260400190565b6040516020818303038152906040528051906020012060001c836040015114600d61066d565b60038260800151600461049891906109ed565b6104a6906040860135610a04565b6104b09190610a1c565b815260208082018051600090819052905160029083018190526040840180516001908190529051840152606084018051829052519092015281511461050a57805115610500578060400151610510565b8060200151610510565b80606001515b608082018190528251602084015191516001600160a01b03909116916108fc9161053a9190610a3e565b6040518115909202916000818181858888f19350505050158015610562573d6000803e3d6000fd5b5081606001516001600160a01b03166108fc836020015183608001516020015161058c9190610a3e565b6040518115909202916000818181858888f193505050501580156105b4573d6000803e3d6000fd5b50600080805560018190556105cb906002906107b4565b505050565b6000606060005460028080546105e59061088d565b80601f01602080910402602001604051908101604052809291908181526020018280546106119061088d565b801561065e5780601f106106335761010080835404028352916020019161065e565b820191906000526020600020905b81548152906001019060200180831161064157829003601f168201915b50505050509050915091509091565b816106925760405163100960cb60e01b81526004810182905260240160405180910390fd5b5050565b8280546106a29061088d565b90600052602060002090601f0160209004810192826106c4576000855561070a565b82601f106106dd57805160ff191683800117855561070a565b8280016001018555821561070a579182015b8281111561070a5782518255916020019190600101906106ef565b506107169291506107f1565b5090565b6040518060a0016040528060008152602001610749604051806040016040528060008152602001600081525090565b815260200161076b604051806040016040528060008152602001600081525090565b815260200161078d604051806040016040528060008152602001600081525090565b81526020016107af604051806040016040528060008152602001600081525090565b905290565b5080546107c09061088d565b6000825580601f106107d0575050565b601f0160209004906000526020600020908101906107ee91906107f1565b50565b5b8082111561071657600081556001016107f2565b60006040828403121561081857600080fd5b50919050565b60006060828403121561081857600080fd5b82815260006020604081840152835180604085015260005b8181101561086457858101830151858201606001528201610848565b81811115610876576000606083870101525b50601f01601f191692909201606001949350505050565b600181811c908216806108a157607f821691505b6020821081141561081857634e487b7160e01b600052602260045260246000fd5b80516001600160a01b03811681146108d957600080fd5b919050565b6000606082840312156108f057600080fd5b6040516060810181811067ffffffffffffffff8211171561092157634e487b7160e01b600052604160045260246000fd5b60405261092d836108c2565b815260208301516020820152604083015160408201528091505092915050565b600060a0828403121561095f57600080fd5b60405160a0810181811067ffffffffffffffff8211171561099057634e487b7160e01b600052604160045260246000fd5b60405261099c836108c2565b815260208301516020820152604083015160408201526109be606084016108c2565b6060820152608083015160808201528091505092915050565b634e487b7160e01b600052601160045260246000fd5b6000828210156109ff576109ff6109d7565b500390565b60008219821115610a1757610a176109d7565b500190565b600082610a3957634e487b7160e01b600052601260045260246000fd5b500690565b6000816000190483118215151615610a5857610a586109d7565b50029056fea2646970667358221220c15086a213f1dc3d99b98124ef061cb8a54228ec41c515f9de605629dd26783c64736f6c634300080c0033`,
  BytecodeLen: 3445,
  Which: `oD`,
  version: 7,
  views: {}
};
const _stateSourceMap = {
  1: {
    at: './index.rsh:45:11:after expr stmt semicolon',
    fs: [],
    msg: null,
    who: 'Module'
  },
  2: {
    at: './index.rsh:54:11:after expr stmt semicolon',
    fs: [],
    msg: null,
    who: 'Module'
  },
  3: {
    at: './index.rsh:70:3:after expr stmt',
    fs: [],
    msg: null,
    who: 'Module'
  }
};
exports._stateSourceMap = _stateSourceMap;
const _Connectors = {
  ALGO: _ALGO,
  ETH: _ETH
};
exports._Connectors = _Connectors;
const _Participants = {
  "Alice": Alice,
  "Bob": Bob
};
exports._Participants = _Participants;
const _APIs = {};
exports._APIs = _APIs;

},{}],4:[function(require,module,exports){
const backend = require('./build/index.main.mjs');

const loadStdlib = require('@reach-sh/stdlib').loadStdlib;
// This connect the site to use https://wallet.myalgo.com wallet and use
// https://bank.testnet.algorand.network/ to get 10ALGO for testing app
const MyAlgoConnect = require('@reach-sh/stdlib').ALGO_MyAlgoConnect

const stdlib = loadStdlib('ALGO');

async function ExecuteGame() {
  stdlib.setWalletFallback(
    stdlib.walletFallback(
      {
        providerEnv: {
          ALGO_TOKEN: '',
          ALGO_SERVER: 'https://testnet-api.algonode.cloud',
          ALGO_PORT: '',
          ALGO_INDEXER_TOKEN: '',
          ALGO_INDEXER_SERVER: 'https://testnet-idx.algonode.cloud',
          ALGO_INDEXER_PORT: ''
        },
        MyAlgoConnect
      }
    )
  );

  // const startingBalance = stdlib.parseCurrency(100);
  // const accAlice = await stdlib.newTestAccount(startingBalance);
  // const accBob = await stdlib.newTestAccount(startingBalance);

  const accAlice = await stdlib.getDefaultAccount();
  const accBob = await stdlib.getDefaultAccount();

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
  const beforeAlice = await getBalance(accAlice);
  const beforeBob = await getBalance(accBob);

  const ctcAlice = accAlice.contract(backend);
  const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

  const HAND = ['Rock', 'Paper', 'Scissors'];
  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];

  const Player = (who) => ({
    ...stdlib.hasRandom,
    getHand: async () => {
      const hand = Math.floor(Math.random() * 3);
      console.log(`${who} played ${HAND[hand]}.`);
      if (Math.random() <= 0.01) {
        for (let i = 0; i < 10; i++) {
          console.log(`${who} takes their sweet time sending it back...`);
          await stdlib.wait(1);
        }
      }

      return hand;
    },
    seeOutCome: (outcome) => {
      console.log(`${who} saw ${OUTCOME[outcome]}`);
    },
    informTimeout: () => {
      console.log(`${who} observed a timeout`)
    }
  })

  await Promise.all([
    ctcAlice.p.Alice({
      ...Player('Alice'),
      wager: stdlib.parseCurrency(5),
      deadline: 10,
    }),
    ctcBob.p.Bob({
      ...Player('Bob'),
      acceptWager: (amt) => {
        console.log(`Bob accept the wager of ${fmt(amt)}`);
      },
    })
  ]);

  const afterAlice = await getBalance(accAlice);
  const afterBob = await getBalance(accBob);

  console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
  console.log(`Bob went from ${beforeBob} to ${afterBob}.`);
}

module.exports.ExecuteGame = ExecuteGame;

},{"./build/index.main.mjs":3,"@reach-sh/stdlib":5}],5:[function(require,module,exports){
(function (process,setImmediate){(function (){

}).call(this)}).call(this,require('_process'),require("timers").setImmediate)
},{"_process":1,"timers":2}]},{},[4])(4)
});