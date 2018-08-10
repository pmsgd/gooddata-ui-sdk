// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';
import identity = require('lodash/identity');

import ChartTransformation from '../../src/components/visualizations/chart/ChartTransformation';
import { VIEW_BY_DIMENSION_INDEX } from '../../src/components/visualizations/chart/constants';

import * as fixtures from '../test_data/fixtures';

import { wrap } from '../utils/wrap';

import '../../styles/scss/charts.scss';

storiesOf('Internal/HighCharts/ChartProperties', module)
    .add('Column chart without gridline', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.customPalette,
                        grid: {
                            enabled: false
                        }
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with label rotation', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.customPalette,
                        xaxis: {
                            rotation: '60'
                        }
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with min and max Y axis', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.customPalette,
                        yaxis: {
                            min: '500000',
                            max: '1000000'
                        }
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart without X and Y axis', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.customPalette,
                        xaxis: {
                            visible: false
                        },
                        yaxis: {
                            visible: false
                        }
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart without X and Y labels', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colors: fixtures.customPalette,
                        xaxis: {
                            labelsEnabled: false
                        },
                        yaxis: {
                            labelsEnabled: false
                        }
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    });
