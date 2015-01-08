module.exports = {
  friendlyName: 'Get machine info',
  description: 'Get metadata for the specified machine within the specified machinepack.',
  extendedDescription: '',
  inputs: {
    machinepack: {
      description: 'The identity of the machinepack this machine belongs to.',
      example: 'machinepack-whatever',
      required: true
    },
    machine: {
      description: 'The identity of the machine to look up.',
      example: 'do-stuff',
      required: true
    },
  },
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'Done.',
      example: {
        identity: 'do-stuff',
        friendlyName: 'Do stuff and things',
        variableName: 'doStuff',
        description: 'Do stuff given other stuff.'
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
      url: util.format('/%s/%s', inputs.machinepack, inputs.machine)
    }).exec({
      error: exits.error,
      success: function (resp){

        var machine;
        try {
          machine = JSON.parse(resp.body);
        }
        catch (e){
          return exits.error(e);
        }

        return exits.success(machine);
      }
    });
  }
};
