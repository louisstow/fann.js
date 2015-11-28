// Avatar represents objects at WebWorker on page context.
function avatarConstructor(initFn) {
  var objID, fannWorker, doing={};

  var C = function(__fannWorker, __objID) {
    fannWorker = __fannWorker;
    objID = __objID;
    fannWorker.avatars[objID] = this;
    if(initFn) initFn();
  }

  C.prototype.getWorker = function(){ return fannWorker };

  C.prototype.__workerResponse = function(doID, error, response) {
    doing[doID](error, response);
    delete doing[doID];
  };

  C.prototype.__workerDo = function(method, args, callback) {
    var doID = Math.random();
    doing[doID] = callback;
    fannWorker.postMessage({doID:doID, obj:objID, method:method, args:args});
  };
  return C;
}


/* * *  Avatar for Network  * * */

var Network = avatarConstructor();

Network.prototype.run = function (inputs, callback) {
  this.__workerDo('run', [inputs], callback);
};

Network.prototype.run_list = function (inputList, callback) {
  this.__workerDo('run_list', [inputList], callback);
};

Network.prototype.export = function (callback) {
  this.__workerDo('export', [], callback);
};


/* * *  Avatar for TrainingData  * * */

var TrainingData = avatarConstructor();

TrainingData.prototype.export = function (callback) {
  this.__workerDo('export', [], callback);
};


/* * *  Replaces the FANN object  * * */

// basePath discover allows to require fann.js from the right URI.
var basePath = './', scriptTags = document.getElementsByTagName('script');
for (var script,i=0; script=scriptTags[i]; i++) {
  if (script.src.indexOf('fann-factory.js')>-1) {
    basePath = script.src.replace(/\/[^\/]+$/, '/');
  }
}

// Build WebWorker, FANN avatar and calls back when FANN_ready() is called.
// This is the only directly accessible function on main context.
exports.createFANNWorker = function(callback) {
  var worker = new Worker(basePath + 'fann.js');
  worker.avatars = {};
  var fann = new FANN(worker, 0);
  worker.onmessage = function (msg) {
    obj = worker.avatars[msg.data.obj];
    obj.__workerResponse(msg.data.doID, msg.data.error, msg.data.response);
  }
  fann.__workerDo('whenReady', [], function(error, response){
    callback(error, fann);
  });
};

var FANN = avatarConstructor();

FANN.prototype.create = function (netDefinition, callback) {
  var me = this;
  this.__workerDo('create', [netDefinition], function(error, objID){
    if (error) callback(error);
    else callback(null, new Network(me.getWorker(), objID));
  });
};

FANN.prototype.createTraining = function (data, callback) {
  var me = this;
  this.__workerDo('createTraining', [data], function(error, objID){
    if (error) callback(error);
    else callback(null, new TrainingData(me.getWorker(), objID));
  });
};


// Do the FANN.init job. Add methods to constructors.
for (var method in mappings) {
	if (mappings[method][2] === 0) continue; // ignore that method.

	var Constructor = (mappings[method][2] === 2) ? TrainingData : Network;

	Constructor.prototype[method] = (function(method){
    return function() {
	    var args = Array.prototype.slice.call(arguments, 0);
	    var callback = args.pop();
	    if (typeof callback !== 'function') {
	      throw new Error('The last parameter on fann-factory methods must be a callback function.');
	    }
	    this.__workerDo(method, args, callback);
	  };
	})(method);
}
