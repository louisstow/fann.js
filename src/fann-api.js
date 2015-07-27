var mappings = {
	/* GLOBAL MAPPINGS */
	'create_standard_array': ['number', ['number', 'number'], 0],
	'read_train_from_file': ['number', ['string'], 0],
	'create_from_file': ['number', ['string'], 0],

	/* NETWORK MAPPINGS */
	'set_activation_steepness': [null, ['number', 'number', 'number', 'number'], 1],
	'set_activation_steepness_layer': [null, ['number', 'number', 'number'], 1],
	'set_activation_steepness_hidden': [null, ['number', 'number'], 1],
	'set_activation_steepness_output': [null, ['number', 'number'], 1],
	'set_activation_function': [null, ['number', 'number', 'number', 'number'], 1],
	'set_activation_function_layer': [null, ['number', 'number', 'number'], 1],
	'set_activation_function_hidden': [null, ['number', 'number'], 1],
	'set_activation_function_output': [null, ['number', 'number'], 1],
	'set_train_stop_function': [null, ['number', 'number'], 1],
	'set_train_error_function': [null, ['number', 'number'], 1],
	'set_bit_fail_limit': [null, ['number', 'number'], 1],
	'set_training_algorithm': [null, ['number', 'number'], 1],
	'set_learning_rate': [null, ['number', 'number'], 1],
	'set_learning_momentum': [null, ['number', 'number'], 1],
	'set_quickprop_decay': [null, ['number', 'number'], 2],
	'set_quickprop_mu': [null, ['number', 'number'], 2],

	'get_bit_fail': ['number', ['number'], 1],
	'get_bit_fail_limit': ['number', ['number'], 1],
	'get_MSE': ['number', ['number'], 1],
	'get_num_input': ['number', ['number'], 1],
	'get_num_output': ['number', ['number'], 1],
	'get_num_layers': ['number', ['number'], 1],
	'get_total_neurons': ['number', ['number'], 1],
	'get_total_connections': ['number', ['number'], 1],
	'get_network_type': ['number', ['number'], 1],
	'get_connection_rate': ['number', ['number'], 1],
	'get_training_algorithm': ['number', ['number'], 1],
	'get_learning_rate': ['number', ['number'], 1],
	'get_learning_momentum': ['number', ['number'], 1],
	'get_activation_function': ['number', ['number', 'number', 'number'], 1],
	'get_activation_steepness': ['number', ['number', 'number', 'number'], 1],
	'get_train_error_function': ['number', ['number'], 1],
	'get_quickprop_decay': ['number', ['number'], 2],
	'get_quickprop_mu': ['number', ['number'], 2],
	'reset_MSE': [null, ['number'], 1],

	'scale_train': [null, ['number', 'number'], 1],
	'descale_train': [null, ['number', 'number'], 1],
	'print_connections': [null, ['number'], 1],
	'print_parameters': [null, ['number'], 1],
	'train_on_data': [null, ['number', 'number', 'number', 'number'], 3],
	'init_weights': [null, ['number', 'number'], 3],
	'randomize_weights': [null, ['number', 'number', 'number'], 1],
	'test': ['number', ['number', 'number', 'number'], 1],
	'test_data': ['number', ['number', 'number'], 3],
	'train': ['number', ['number', 'number', 'number'], 1],
	'train_epoch': ['number', ['number', 'number'], 3],
	'run': ['number', ['number', 'number'], 1],
	'save': ['number', ['number', 'string'], 1],

	// cascade
	'cascadetrain_on_data': [null, ['number', 'number', 'number', 'number', 'number'], 3],
	'set_cascade_activation_steepnesses': [null, ['number', 'number', 'number'], 1],

	/* TRAINING DATA MAPPINGS */
	'shuffle_train_data': [null, ['number'], 2],
	'destroy_train': [null, ['number'], 2],
	'duplicate_train_data': ['number', ['number'], 2],
	'save_train': ['number', ['number', 'string'], 2],
	'length_train_data': ['number', ['number'], 2],
	'num_input_train_data': ['number', ['number'], 2],
	'num_output_train_data': ['number', ['number'], 2],
};

function Network (nn) {
	this.pointer = nn;
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

Network.prototype.export = function () {
	this.save('/network');
	var data = FS.readFile('/network', {encoding: 'utf8'});
	FS.unlink('/network');
	return data;
};

function TrainingData (data) {
	this.pointer = data;
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

var FANN = {
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
		
		if (window.FANN_ready) {
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

enums(
	"TRAIN_INCREMENTAL",
	"TRAIN_BATCH",
	"TRAIN_RPROP",
	"TRAIN_QUICKPROP",
	"TRAIN_SARPROP"
);

enums(
	"LINEAR",
	"THRESHOLD",
	"THRESHOLD_SYMMETRIC",
	"SIGMOID",
	"SIGMOID_STEPWISE",
	"SIGMOID_SYMMETRIC",
	"SIGMOID_SYMMETRIC_STEPWISE",
	"GAUSSIAN",
	"GAUSSIAN_SYMMETRIC",
	"GAUSSIAN_STEPWISE",
	"ELLIOT",
	"ELLIOT_SYMMETRIC",
	"LINEAR_PIECE",
	"LINEAR_PIECE_SYMMETRIC",
	"SIN_SYMMETRIC",
	"COS_SYMMETRIC",
	"SIN",
	"COS"
);

enums(
	"ERRORFUNC_LINEAR",
	"ERRORFUNC_TANH"
);

enums(
	"STOPFUNC_MSE",
	"STOPFUNC_BIT"
);

enums(
	"NETTYPE_LAYER",
	"NETTYPE_SHORTCUT"
);