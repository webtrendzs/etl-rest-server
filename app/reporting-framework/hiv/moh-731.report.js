import {
    MultiDatasetPatientlistReport
} from '..//multi-dataset-patientlist.report';
import ReportProcessorHelpersService from '../report-processor-helpers.service';
import {
    Promise
} from 'bluebird';
const moh731defs = require('./moh-731-2017');
const dao = require('../../../etl-dao');

export class Moh731Report extends MultiDatasetPatientlistReport {
    constructor(params) {
        if (params.isAggregated) {
            params.excludeParam = ['location_id', 'arv_first_regimen_location_id'];
            params.joinColumnParam = 'join_location';
        }
        super('MOH-731-greencard', params)
    }

    generateReport(additionalParams) {
        const that = this;
        return new Promise((resolve, reject) => {
            super.generateReport(additionalParams)
                .then((results) => {
                    if (additionalParams && additionalParams.type === 'patient-list') {
                        resolve(results);
                    } else {

                        let finalResult = []
                        const reportProcessorHelpersService = new ReportProcessorHelpersService();
                        for (let result of results) {
                            if (result.report && result.report.reportSchemas && result.report.reportSchemas.main &&
                                result.report.reportSchemas.main.transFormDirectives.joinColumn) {
                                finalResult = reportProcessorHelpersService
                                    .joinDataSets(that.params[result.report.reportSchemas.main.transFormDirectives.joinColumnParam] ||
                                        result.report.reportSchemas.main.transFormDirectives.joinColumn,
                                        finalResult, result.results.results.results);

                            }
                        }
                        resolve({
                            queriesAndSchemas: results,
                            result: finalResult,
                            sectionDefinitions: moh731defs,
                            indicatorDefinitions: []
                        });
                    }
                })
                .catch((error) => {
                    console.error('MOH 731 generation error: ', error);
                    reject(error);
                });
        });
    }

    generatePatientListReport(indicators) {
        let self = this;
        return new Promise((resolve, reject) => {
            super.generatePatientListReport(indicators)
                .then((results) => {
                    let indicatorLabels = self.getIndicatorSectionDefinitions(results.indicators,
                        moh731defs);

                    results.indicators = indicatorLabels;

                    self.resolveLocationUuidsToName(self.params.locationUuids)
                        .then((locations) => {
                            results.locations = locations;
                            resolve(results);
                        })
                        .catch((err) => {
                            resolve(results);
                        });

                })
                .catch((err) => {
                    console.error('MOH patient list generation error', err);
                    reject(err);
                });
        });
    }

    getIndicatorSectionDefinitions(requestIndicators, sectionDefinitions) {
        let results = [];
        _.each(requestIndicators, function (requestIndicator) {
            _.each(sectionDefinitions, function (sectionDefinition) {
                _.each(sectionDefinition.indicators, function (indicator) {
                    if (indicator.indicator === requestIndicator) {
                        // console.log('Found indicator', requestIndicator);
                        results.push(indicator);
                    }
                });
            });
        });
        return results;
    }

    resolveLocationUuidsToName(uuids) {
        return new Promise((resolve, reject) => {
            // resolve location name
            dao.resolveLocationUuidsToName(uuids.split(','), (loc) => {
                resolve(loc);
            });
        });
    }
}