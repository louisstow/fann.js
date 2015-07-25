#!/bin/sh

funcs="
'_fann_create_standard',
'_fann_create_standard_array',
'_fann_read_train_from_file',
'_fann_set_activation_steepness_hidden',
'_fann_set_activation_steepness_output',
'_fann_set_activation_function_hidden',
'_fann_set_activation_function_output',
'_fann_set_train_stop_function',
'_fann_set_bit_fail_limit',
'_fann_set_training_algorithm',
'_fann_init_weights',
'_fann_train_on_data',
'_fann_run',
'_fann_print_connections',
'_fann_print_parameters',
'_fann_reset_MSE',
'_fann_get_MSE',
'_fann_test',
'_fann_train',
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
'_fann_test_data',
'_fann_shuffle_train_data',
'_fann_destroy_train',
'_fann_duplicate_train_data',
'_fann_save_train',
'_fann_save',
'_fann_create_from_file'
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
		emcc --memory-init-file 0 -O3 -s NO_BROWSER=1 -s NO_EXIT_RUNTIME=1 -s EXPORTED_FUNCTIONS="[$funcs]" -Isrc/include src/libfann.so -o ../out/fann.js
		cd ..
		cat src/fann-api.js out/fann.js > out/build.js
	;;
esac
