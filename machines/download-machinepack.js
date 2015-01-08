module.exports = {
  friendlyName: 'Download machinepack',
  description: 'Download the specified machinepack and parse its machines into code strings.',
  extendedDescription: '',
  inputs: {
    machinepack: {
      description: 'The identity of the machinepack to look up.',
      example: 'machinepack-whatever',
      required: true
    }
  },
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'Done.',
      // example: {
      //   identity: 'machinepack-whatever',
      //   friendlyName: 'Whatever (you know)',
      //   variableName: 'Whatever',
      //   description: 'Node.js utilities for working with whatever.',
      //   extendedDescription: '...',
      //   npmPackageName: 'machinepack-whatever',
      //   version: '1.2.3',
      //   latestVersionPublishedAt: '2014-12-28T07:01:30.069Z',
      //   nodeMachineUrl: 'http://node-machine.org/machinepack-whatever',
      //   githubUrl: 'https://github.com/mikermcneil/machinepack-whatever',
      //   npmUrl: 'http://npmjs.org/package/machinepack-whatever',
      //   contributors: [{
      //     name: 'Marty McFly',
      //     email: 'marty@dolorian-tardis.edu'
      //   }],
      //   machines: [{
      //     identity: 'do-stuff',
      //     definition: {}
      //     // code: 'module.exports = {"identity": "do-stuff","friendlyName": "Do stuff and things","variableName": "doStuff","description": "Do stuff given other stuff.","fn":"thestringified fn"};'
      //   }]
      // }
    }
  },
  fn: function(inputs, exits) {
    var util = require('util');
    var path = require('path');
    var _ = require('lodash');
    var async = require('async');
    var enpeem = require('enpeem');
    var Http = require('machinepack-http');
    var Npm = require('machinepack-npm');
    var Machines = require('machinepack-machines');

    var registryBaseUrl = 'http://node-machine.org';

    // Look up machinepack, including list of machines
    Http.sendHttpRequest({
      baseUrl: registryBaseUrl,
      url: util.format('/%s', inputs.machinepack)
    }).exec({
      error: exits.error,
      success: function (resp){

        var machinepack;
        try {
          machinepack = JSON.parse(resp.body);
        }
        catch (e){
          return exits.error(e);
        }

        Npm.downloadPackage({
          name: machinepack.npmPackageName,
          version: machinepack.version
        }).exec({
          error: exits.error,
          success: function (machinepackPath){

            // Set present working directory to the `machinepackPath`
            // (remembering the previous cwd for later)
            var cwd = process.cwd();
            process.chdir(machinepackPath);

            console.log('Installing NPM dependencies for %s...',machinepack.identity);
            enpeem.install({
              dependencies: [],
              loglevel: 'silent'
            }, function (err){
              if (err) return exits.error(err);

              // Return to previous present working directory
              process.chdir(cwd);

              // Determine the local, temporary path to this machinepack's "machines/"
              // directory on disk.
              Machines.getMachinesDir({
                dir: machinepackPath
              }).exec({
                error: exits.error,
                success: function (machinesDirPath){

                  // Now load the JavaScript code string for each of this pack's machines.
                  var machinesAsJs = [];
                  async.each(machinepack.machines, function (machine, next){

                    var machineDef = require(path.resolve(machinesDirPath, machine.identity+'.js'));
                    machinesAsJs.push({
                      identity: machine.identity,
                      definition: stringifyRuntimeMachine(machineDef)
                    });
                    next();

                    // Machines.readMachineFile({
                    //   source: path.resolve(machinesDirPath, machine.identity+'.js')
                    // }).exec({
                    //   error: next,
                    //   success: function (js){
                    //     machinesAsJs.push({
                    //       identity: machine.identity,
                    //       code: js
                    //     });
                    //     next();
                    //   }
                    // });
                  }, function afterwards(err){
                    if (err) return exits.error(err);

                    // Rebuild the `machines` array using the code strings
                    machinepack.machines = machinesAsJs;

                    return exits.success(machinepack);
                  });
                }
              });


            });
          }
        });
      }
    });



    function stringifyRuntimeMachine(obj) {
      var str = "{\n";
      str += _.reduce(obj, function(memo, val, key) {
        var str = '"' + key + '": ';
        if (typeof val == 'object' && val !== null) {
          str += stringifyRuntimeMachine(val);
        } else if (typeof val == 'function') {
          var fn = val.toString();
          fn = fn.replace(/^([\W]*?function\s+\(.*?\).*?\{[\W*])([\w\W]*)\}$/, "$2");
          fn = fn.replace(/^\t\t/mg, '');
          str += JSON.stringify(fn);
        } else {
          str += JSON.stringify(val);
        }
        memo.push(str);
        return memo;
      }, []).join(",\n");
      str += "}\n";
      return str;
    }
  }
};
