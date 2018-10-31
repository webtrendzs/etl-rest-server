var authorizer = require('../../authorization/etl-authorizer');
var privileges = authorizer.getAllPrivileges();
import {
  BaseMysqlReport
} from '../reporting-framework/base-mysql.report'
const routes  = [
  {
    method: 'GET',
    path: '/etl/patient/{uuid}/genexpert-images',
    config: {
      plugins: {
        'hapiAuthorization': {
          role: privileges.canViewPatient
        }
      },
      handler: function (request, reply) {
        let baseReport = new BaseMysqlReport('genexpertBase', request.params);
        baseReport.generateReport().then((result) => {
          reply(result);
        }).catch((err) => {
          reply(err);
        })
      },
      description: 'Get image results for genexpert in lab data summary',
      notes: "Get image results for genexpert in lab data summary",
      tags: ['api'],
      validate: {
        options: {
          allowUnknown: true
        },
        params: {
        }
      }
    }
  }
];
exports.routes = server => server.route(routes);