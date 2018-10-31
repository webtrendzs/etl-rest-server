'use strict';
var Promise = require('bluebird');
var db = require('../../etl-db');

module.exports = getPatientGenexpert;

function getPatientGenexpert(patientUuid, params, startIndex, limit) {
  
  let whereClause = clinicalOnly ?
    ['uuid = ? AND is_clinical_encounter = true', patientUuid] :
    ['uuid = ?', patientUuid];
  var queryObject = {
    columns: '*',
    table: 'etl.flat_hiv_summary_v15b',
    where: whereClause,
    order: [{
      column: 'encounter_datetime',
      asc: false
    }],
    offset: startIndex,
    limit: limit
  };
  
  return db.queryDb(queryObject);
}