# FANN.js

The [FANN](http://leenissen.dk/fann/index.php) (Fast Artificial Neural Network) library compiled through Emscripten. This library contains some higher level bindings.

Much of the [original documentation](http://leenissen.dk/fann/html/files/fann-h.html) is still relevant. The noticable changes will be documented below. Note not all functions have a binding. You may see mention of Fixed vs Float mode, FANN.js uses Float mode.

## How to use

FANN.js can be used almost like for like with the original library. These bindings provide an object oriented approach. For example take [`fann_print_connections(ann)`](http://leenissen.dk/fann/html/files/fann-h.html#fann_print_connections). In FANN.js this function is available on a Network instance as `network.print_connections()`. Notice the `fann_` prefix isn't necessary nor is passing the neural network reference.

## FANN.

**`Network create(num_layers Number, neurons Array<Number>)`**
- `num_layers` the number of layers
- `neurons` the number of neurons in an array

Create a network with the provided structure. Returns an instance of the [Network](#Network) class. The first argument is the number of layers including the input and output layer. The neurons argument specified how many neurons in that layer. The first index will be the input layer, the last index will be the output layer and anything between will be hidden layer(s).

~~~js
var network = FANN.create(3, [2, 2, 1]);
// Input layer: 2 neurons
// Hidden layers (1): 2 neurons
// Output layer: 1 neuron
~~~

**`Network create(exported_network String)`**
- `exported_network` String of a network exported through `.export()`

Create a network from a previously exported network as a string. This is useful when restoring a network.

**`TrainingData createTraining(Array data)`**
- `data` a multidimensional array containing a set of inputs and desired outputs.

Create a TrainingData instance based on the provided data. 

~~~js
var tdata = FANN.createTraining([
    [[-1, -1], [-1]],
    [[ 1,  1], [-1]],
    [[-1,  1], [ 1]],
    [[ 1, -1], [ 1]]
]);
~~~

**`TrainingData createTraining(String data)`**
- `data` a string of the training data. The required format is [documented here](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_read_train_from_file).

Create a TrainingData instance based on the provided data. The string format will be the same as when exported via `.export()`.

## Network.

**`Array<Number> run(inputs Array<Number>)`**
- `inputs` array of number inputs. Length should correspond to the amount of input neurons

Run the network with a set of inputs. Returns an array of the output neurons value.

~~~js
var network = FANN.create(3, [2, 2, 1]);
console.log(network.run([-1, 1]));
~~~

**`String export()`**

Returns a large string containing a snapshot of the network. You can store this string and restore a network based on the snapshot data using `FANN.create()`.

### Other functions

- [`train()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_train)
- [`train_on_data()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_train_on_data)
- [`train_epoch()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_train_epoch)
- [`test()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_test)
- [`test_data()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_test_data)
- [`run()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_run)
- [`print_connections()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_print_connections)
- [`print_parameters()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_print_connections)
- [`randomize_weights()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_init_weights)
- [`init_weights()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_randomize_weights)
- [`cascadetrain_on_data()`](http://leenissen.dk/fann/html/files/fann_cascade-h.html#fann_cascadetrain_on_data)
- [`get_num_input()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_num_input)
- [`get_num_output()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_num_output)
- [`get_num_layers()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_num_layers)
- [`get_total_neurons()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_total_neurons)
- [`get_total_connections()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_total_connections)
- [`get_network_type()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_network_type)
- [`get_connection_rate()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_connection_rate)
- [`get_training_algorithm()`](http://leenissen.dk/fann/html/files/fann-h.html#fann_get_training_algorithm)
- [`get_learning_rate()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_get_learning_rate)
- [`get_learning_momentum()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_get_learning_momentum)
- [`get_activation_function()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_get_activation_function)
- [`get_activation_steepness()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_get_activation_steepness)
- [`get_train_error_function()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_get_train_error_function)
- [`get_quickprop_decay()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_get_quickprop_decay)
- [`get_quickprop_mu()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_get_quickprop_mu)
- [`reset_MSE()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_reset_MSE)
- [`set_activation_steepness()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_steepness)
- [`set_activation_steepness_layer()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_steepness_layer)
- [`set_activation_steepness_hidden()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_steepness_hidden)
- [`set_activation_steepness_output()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_steepness_output)
- [`set_activation_function()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_function)
- [`set_activation_function_layer()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_function_layer)
- [`set_activation_function_hidden()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_function_hidden)
- [`set_activation_function_output()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_activation_function_output)
- [`set_train_stop_function()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_train_stop_function)
- [`set_train_error_function()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_train_error_function)
- [`set_bit_fail_limit()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_bit_fail_limit)
- [`set_training_algorithm()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_training_algorithm)
- [`set_learning_rate()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_learning_rate)
- [`set_learning_momentum()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_learning_momentum)
- [`set_quickprop_decay()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_quickprop_decay)
- [`set_quickprop_mu()`](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_set_quickprop_mu)

## TrainingData.

**`String export()`**

Returns a large string containing a snapshot of the training data. You can store this string and create a TrainingData instance using `FANN.createTraining()`.

## Compiling

After cloning, simply run `./build.sh build`. The built file will be in the root directory as `fann.js`.