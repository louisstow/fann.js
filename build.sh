#!/bin/sh

funcs="
'_fann_create_standard',
'_fann_create_standard_array',
'_fann_read_train_from_file',
'_fann_set_activation_steepness',
'_fann_set_activation_steepness_layer',
'_fann_set_activation_steepness_hidden',
'_fann_set_activation_steepness_output',
'_fann_set_activation_function_hidden',
'_fann_set_activation_function_output',
'_fann_set_train_stop_function',
'_fann_set_train_error_function',
'_fann_set_bit_fail_limit',
'_fann_set_training_algorithm',
'_fann_set_learning_rate',
'_fann_set_learning_momentum',
'_fann_set_activation_function',
'_fann_set_activation_function_layer',
'_fann_set_activation_function_hidden',
'_fann_set_activation_function_output',
'_fann_set_quickprop_decay',
'_fann_set_quickprop_mu',
'_fann_init_weights',
'_fann_train_on_data',
'_fann_run',
'_fann_print_connections',
'_fann_print_parameters',
'_fann_reset_MSE',
'_fann_get_MSE',
'_fann_test',
'_fann_train',
'_fann_train_epoch',
'_fann_get_bit_fail',
'_fann_get_bit_fail_limit',
'_fann_get_MSE',
'_fann_randomize_weights',
'_fann_get_num_input',
'_fann_get_num_output',
'_fann_get_total_neurons',
'_fann_get_total_connections',
'_fann_get_network_type',
'_fann_get_connection_rate',
'_fann_get_num_layers',
'_fann_get_training_algorithm',
'_fann_get_learning_rate',
'_fann_get_learning_momentum',
'_fann_get_activation_function',
'_fann_get_activation_steepness',
'_fann_get_train_error_function',
'_fann_get_quickprop_decay',
'_fann_get_quickprop_mu',
'_fann_test_data',
'_fann_shuffle_train_data',
'_fann_destroy_train',
'_fann_duplicate_train_data',
'_fann_save_train',
'_fann_save',
'_fann_create_from_file',
'_fann_scale_train',
'_fann_descale_train',
'_fann_length_train_data',
'_fann_num_input_train_data',
'_fann_num_output_train_data',
'_fann_cascadetrain_on_data',
'_fann_set_cascade_activation_steepnesses'
"

echo $funcs

case "$1" in
	"clean")
		echo "[+] cleaning"
		find fann -name "CMakeFiles" | xargs rm -rf
		find fann -name "cmake_install.cmake" | xargs rm -rf
		rm fann/CMakeCache.txt
		rm fann/src/*.so
		rm fann/src/*.so.*
	;;

	"build")
		git submodule update --init
		cd fann
		emcmake cmake -DCMAKE_BUILD_TYPE=Debug
		make
		emcc --memory-init-file 0 -O3 -s NO_BROWSER=1 -s NO_EXIT_RUNTIME=1 -s EXPORTED_FUNCTIONS="[$funcs]" -Isrc/include src/libfann.so -o ../out/build.js
		cd ..
		cat src/fann-api.js out/build.js > fann.js
	;;
esac
