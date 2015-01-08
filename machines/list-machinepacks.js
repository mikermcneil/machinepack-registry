module.exports = {
  friendlyName: 'List machinepacks',
  description: 'List machinepacks in the registry.',
  extendedDescription: '',
  inputs: {},
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'Done.',
      example: [{
        identity: 'machinepack-whatever',
        friendlyName: 'Whatever (you know)',
        variableName: 'Whatever',
        description: 'Node.js utilities for working with whatever.',
      }]
    }
  },
  fn: function(inputs, exits) {
    var Http = require('machinepack-http');

    var registryBaseUrl = 'http://node-machine.org';

    // Look up list of machinepacks
    Http.sendHttpRequest({
      baseUrl: registryBaseUrl,
      url: '/machinepacks'
    }).exec({
      error: exits.error,
      success: function (resp){

        var machinepacks;
        try {
          machinepacks = JSON.parse(resp.body);
        }
        catch (e){
          return exits.error(e);
        }

        return exits.success(machinepacks);
      }
    });
  }
};
