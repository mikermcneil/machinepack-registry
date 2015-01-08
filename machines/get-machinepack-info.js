module.exports = {
  friendlyName: 'Get machinepack info',
  description: 'Get metadata for the specified machinepack, including a list of its machines.',
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
      example: {
        identity: 'machinepack-whatever',
        friendlyName: 'Whatever (you know)',
        variableName: 'Whatever',
        description: 'Node.js utilities for working with whatever.',
        machines: [{
          identity: 'do-stuff',
          friendlyName: 'Do stuff and things',
          variableName: 'doStuff',
          description: 'Do stuff given other stuff.'
        }]
      }
    }
  },
  fn: function(inputs, exits) {
    var util = require('util');
    var Http = require('machinepack-http');

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

        return exits.success(machinepack);
      }
    });
  }
};
