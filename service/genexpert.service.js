import {
  BaseMysqlReport
} from '../base-mysql.report';

const Promise = require("bluebird");
const _       = require('lodash');

export class GenexpertService {
  
  constructor() {
  
  }
  
  getAggregateReport (reportParams) {
    let self   = this;
    let params = reportParams.requestParams;
    
    let report = new BaseMysqlReport('genexpertBase', params);
    return new Promise(function (resolve, reject) {
      Promise.join(report.generateReport(), (result) = > {
        let returnedResult = {};
        returnedResult.schemas  = result.schemas;
        returnedResult.sqlQuery = result.sqlQuery;
        returnedResult.result   = result.results.results;
        resolve(returnedResult);
        //TODO Do some post processing
      }).catch((errors) = > {
        reject (errors);
      });
    });
  }
}