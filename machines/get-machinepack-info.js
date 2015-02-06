module.exports = {
  friendlyName: 'Get machinepack info',
  description: 'Get metadata for the specified machinepack, including a list of its machines.',
  extendedDescription: '',
  inputs: {
    machinepack: {
      description: 'The identity of the machinepack to look up.',
      example: 'machinepack-whatever',
      required: true
    },
    registry: {
      description: 'The base URL of the machine registry to use (defaults to the public registry at http://node-machine.org)',
      example: 'http://node-machine.org'
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
        npmPackageName: 'machinepack-facebook',
        identity: 'machinepack-facebook',
        friendlyName: 'Facebook',
        variableName: 'Facebook',
        description: 'asg',
        version: '0.1.1',
        keywords: ['machine'],
        latestVersionPublishedAt: '2015-01-19T22:26:54.588Z',
        author: 'Marty McFly <marty@mcfly.com>',
        nodeMachineUrl: 'http://node-machine.org/machinepack-foo',
        npmUrl: 'http://npmjs.org/package/machinepack-foo',
        sourceCodeUrl: 'https://github.com/baz/machinepack-foo',
        githubUrl: 'https://github.com/baz/machinepack-foo',
        machineDir: 'machines/',
        contributors: [{
          name: 'Doc Brown',
          email: 'doc@brown.com'
        }],
        dependencies: [{
          name: 'lodash',
          semverRange: '^2.4.1'
        }],
        license: 'MIT',
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

    var registryBaseUrl = inputs.registry || 'http://www.node-machine.org';

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
