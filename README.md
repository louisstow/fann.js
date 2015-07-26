# FANN.js

The [FANN](http://leenissen.dk/fann/index.php) (Fast Artificial Neural Network) library compiled through Emscripten. This library contains some higher level bindings.

Much of the [original documentation](http://leenissen.dk/fann/html/files/fann-h.html) is still relevant. The noticable changes will be documented below. Note not all functions have a binding. You may see mention of Fixed vs Float mode, FANN.js uses Float mode.

## FANN

**`Network create(num_layers Number, neurons Array<Number>)`**
- `num_layers` the number of layers
- `neurons` the number of neurons in an array

Create a network with the provided structure. Returns an instance of the [Network](#Network) class.

~~~
FANN.create(3, [2, 2, 1]);
// Input layer: 2 neurons
// Hidden layers (1): 2 neurons
// Output layer: 1 neuron
~~

**`Network create(exported_network String)`**
- `exported_network` String of a network exported through `.export()`

Create a network from a previously exported network as a string. This is useful when restoring a network.

**`TrainingData createTraining(Array data)`**
- `data` a multidimensional array containing a set of inputs and desired outputs.

Create a TrainingData instance based on the provided data. 

~~~
FANN.createTraining([
    [[-1, -1], [-1]],
    [[ 1,  1], [-1]],
    [[-1,  1], [ 1]],
    [[ 1, -1], [ 1]]
]);
~~~

**`TrainingData createTraining(String data)`**
- `data` a string of the training data. The required format is [documented here](http://leenissen.dk/fann/html/files/fann_train-h.html#fann_read_train_from_file).

Create a TrainingData instance based on the provided data. The string format will be the same as when exported via `.export()`.

## Network

**`Array<Number> run(inputs Array<Number>)`**
- `inputs` array of number inputs. Length should correspond to the amount of input neurons

Run the network with a set of inputs. Returns an array of the output neurons value.

~~~
var network = FANN.create(3, [2, 2, 1]);
console.log(network.run([-1, 1]));
~~~

**`String export()`**

Returns a large string containing a snapshot of the network. You can store this string and restore a network based on the snapshot data using `FANN.create()`.

## TrainingData

**`String export()`**

Returns a large string containing a snapshot of the training data. You can store this string and create a TrainingData instance using `FANN.createTraining()`.