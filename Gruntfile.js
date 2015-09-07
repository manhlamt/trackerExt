/**
 * Created by lam on 16/6/14.
 */
module.exports = function (grunt) {
    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: './app/assets/lib',
                    layout: 'byType',
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false,
                    bowerOptions: {}
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.registerTask('default', ['bower']);
};