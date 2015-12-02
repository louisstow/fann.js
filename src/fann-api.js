function Network (nn) {
    this.pointer = nn;
}

Network.prototype.getPointer = function () {
    return this.pointer;
}

Network.prototype._run = function (inputs) {
    var inputData = Module.setValues(inputs, 'float', 4);
    var outputPtr = this._run(inputData);
    Module._free(inputData);

    var outputs = this.get_num_output();
    var outputArray = [];
    for (var i = 0; i < outputs; ++i) {
        outputArray[i] = Module.getValue(outputPtr + (i * 4), 'float')
    }

    return outputArray;
};

Network.prototype.run_list = function (inputList) {
    var result = [];
    for (var l=inputList.length, i=0; i<l; i++) {
        result.push( this.run(inputList[i]) );
    }
    return result;
};

Network.prototype.export = function () {
    this.save('/network');
    var data = FS.readFile('/network', {encoding: 'utf8'});
    FS.unlink('/network');
    return data;
};

function TrainingData (data) {
    this.pointer = data;
}

TrainingData.prototype.getPointer = function () {
    return this.pointer;
}

TrainingData.prototype._destroy_train = function () {
    this.pointer = null;
    this._destroy_train();
};

TrainingData.prototype._duplicate_train_data = function () {
    var ptr = this._duplicate_train_data();
    return new TrainingData(ptr);
};

TrainingData.prototype.export = function () {
    this.save_train("/training");
    var data = FS.readFile('/training', {encoding: 'utf8'});
    FS.unlink('/training');
    return data;
};

exports.FANN = {
    init: function () {
        for (var key in mappings) {
            this[key] = Module.cwrap(
                'fann_' + key,
                mappings[key][0],
                mappings[key][1]
            );

            var Fn = Network;
            if (mappings[key][2] === 0) {
                continue;
            } else if (mappings[key][2] === 2) {
                Fn = TrainingData;
            }

            // support instance arguments
            if (mappings[key][2] === 3) {
                Fn.prototype[key] = (function (k) {
                    return function () {
                        var args = Array.prototype.slice.call(arguments, 0);
                        if (typeof args[0] === 'object' && args[0].pointer)
                            args[0] = args[0].pointer;

                        args.unshift(this.pointer);
                        return FANN[k].apply(this, args);
                    }
                })(key);
            } else {
                Fn.prototype[key] = (function (k) {
                    return function () {
                        var args = Array.prototype.slice.call(arguments, 0);
                        args.unshift(this.pointer);
                        return FANN[k].apply(this, args);
                    }
                })(key);
            }
        }

        wrapFunc(Network, 'run');
        wrapFunc(TrainingData, 'destroy_train');
        wrapFunc(TrainingData, 'duplicate_train_data');

        FANN._initialized = true;

        if (exports.FANN_ready) {
            FANN_ready();
        }
    },

    create: function (neurons) {
        if (typeof neurons === 'string') {
            FS.writeFile('/network', neurons);
            var ptr = FANN.create_from_file('/network');
            FS.unlink('/network');
            return new Network(ptr);
        }

        var neuronsPtr = Module.setValues(neurons, 'i32', 4);
        var network = FANN.create_standard_array(neurons.length, neuronsPtr);
        Module._free(neuronsPtr);
        return new Network(network);
    },

    createTraining: function (data) {
        var d = new TrainingData();

        if (typeof data === 'string') {
            FS.writeFile("/training", data);
        } else {
            var str = [[data.length, data[0][0].length, data[0][1].length].join(" ")];
            for (var i = 0; i < data.length; ++i) {
                str.push(data[i][0].join(" "));
                str.push(data[i][1].join(" "));
            }

            FS.writeFile("/training", str.join('\n'));
        }

        d.pointer = FANN.read_train_from_file("/training");
        d.data = data;

        FS.unlink("/training");
        return d;
    }
};

var Module = {
    onRuntimeInitialized: function () {
        setTimeout(function () {
            FANN.init();
        }, 0);
    },

    /**
    * Module.setValues(values, type, size)
    * values - array of values to set
    * type - llvm type string
    * size - size of individual value in bytes
    *
    * Will allocate memory and return a pointer.
    */
    setValues: function (values, type, size) {
        var ptr = Module._malloc(values.length * size);
        for (var i = 0; i < values.length; ++i) {
            Module.setValue(
                ptr + (i * size),
                values[i],
                type
            );
        }

        return ptr;
    }
};

function enums () {
    for (var i = 0; i < arguments.length; ++i) {
        FANN[arguments[i]] = i;
    }
}

function wrapFunc (Fn, method) {
    var wrapper = Fn.prototype['_' + method];
    Fn.prototype['_' + method] = Fn.prototype[method];
    Fn.prototype[method] = wrapper;
}


/* * *  Avatar Support  * * */

realObjects = {
    0: { // FANN connector
        create: function(netDefinition) {
            realObjects[++lastObjID] = FANN.create(netDefinition);
            return lastObjID;
        },
        createTraining: function(data) {
            realObjects[++lastObjID] = FANN.createTraining(data);
            return lastObjID;
        }
    }
};
lastObjID = 0;

exports.addEventListener('message', function(msg) {
    var data = msg.data;
    if (data.obj!==undefined && data.doID!==undefined) {
        if (data.obj===0 && data.method==='whenReady') {
            var ready = exports.FANN_ready = function() {
                postMessage({obj:0, doID:data.doID});
            }
            if (FANN._initialized) ready(); // ensure post init call of whenReady().
        } else {
            var obj = realObjects[data.obj];
            var error = null, response = null;
            try {
                response = obj[data.method].apply(obj, data.args);
            } catch(err) {
                error = err.message;
            }
            postMessage({obj:data.obj, doID:data.doID, error:error, response:response});
        }
    }
});
