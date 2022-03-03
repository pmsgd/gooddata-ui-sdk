// (C) 2019 GoodData Corporation
import React from "react";
import cloneDeep from "lodash/cloneDeep";
import isEmpty from "lodash/isEmpty";
import set from "lodash/set";
import tail from "lodash/tail";
import { BucketNames, IDrillEvent, VisualizationTypes } from "@gooddata/sdk-ui";
import { render } from "react-dom";
import { BUCKETS, DATE, ATTRIBUTE } from "../../../constants/bucket";
import { TREEMAP_SUPPORTED_PROPERTIES } from "../../../constants/supportedProperties";

import { getTreemapUiConfig } from "../../../constants/uiConfig";
import {
    IDrillDownContext,
    IExtendedReferencePoint,
    IReferencePoint,
    IVisConstruct,
    IDrillDownDefinition,
} from "../../../interfaces/Visualization";
import { configureOverTimeComparison, configurePercent } from "../../../utils/bucketConfig";

import {
    getAttributeItemsWithoutStacks,
    getMeasureItems,
    getStackItems,
    isDateBucketItem,
    limitNumberOfMeasuresInBuckets,
    removeAllArithmeticMeasuresFromDerived,
    removeAllDerivedMeasures,
    sanitizeFilters,
} from "../../../utils/bucketHelper";
import { getReferencePointWithSupportedProperties } from "../../../utils/propertiesHelper";
import { removeSort } from "../../../utils/sort";

import { setTreemapUiConfig } from "../../../utils/uiConfigHelpers/treemapUiConfigHelper";
import TreeMapConfigurationPanel from "../../configurationPanels/TreeMapConfigurationPanel";
import { PluggableBaseChart } from "../baseChart/PluggableBaseChart";
import { IInsight, IInsightDefinition } from "@gooddata/sdk-model";
import {
    addIntersectionFiltersToInsight,
    modifyBucketsAttributesForDrillDown,
    reverseAndTrimIntersection,
} from "../drillDownUtil";

/**
 * PluggableTreemap
 *
 * ## Buckets
 *
 * | Name      | Id       | Accepts             |
 * |-----------|----------|---------------------|
 * | Measures  | measures | measures only       |
 * | ViewBy    | view     | attributes or dates |
 * | SegmentBy | segment  | attributes or dates |
 *
 * ### Bucket axioms
 *
 * - |ViewBy| ≥ 1 ⇒ |Measures| ≤ 1
 * - |ViewBy| = 0 ⇒ |Measures| ≤ 20
 * - |Measures| ≥ 1 ⇒ |ViewBy| = 0
 * - |Measures| ≤ 1 ⇒ |ViewBy| ≤ 1
 * - |SegmentBy| ≤ 1
 *
 * ## Dimensions
 *
 * The PluggableTreemap always creates two dimensional execution.
 *
 * - |ViewBy| + |SegmentBy| = 1 ⇒ [[MeasureGroupIdentifier], [...ViewBy, ...SegmentBy]]
 * - |ViewBy| + |SegmentBy| != 1 ⇒ [[...ViewBy, ...SegmentBy], [MeasureGroupIdentifier]]
 *
 * ## Default sorts
 *
 * - |ViewBy| ≥ 1 ∧ |SegmentBy| ≥ 1 ⇒ [attributeSort(ViewBy[0]), measureSort(...Measures)]
 * - |ViewBy| = 0 ∧ |SegmentBy| = 0 ⇒ []
 */
export class PluggableTreemap extends PluggableBaseChart {
    constructor(props: IVisConstruct) {
        super(props);
        this.type = VisualizationTypes.TREEMAP;
        this.supportedPropertiesList = TREEMAP_SUPPORTED_PROPERTIES;
        this.initializeProperties(props.visualizationProperties);
    }

    private getBucketItemsWithMultipleDates(newReferencePoint: IReferencePoint): any {
        const buckets = newReferencePoint?.buckets ?? [];
        let measures = getMeasureItems(buckets);
        let stacks = getStackItems(buckets, [ATTRIBUTE, DATE]);
        const nonStackAttributes = getAttributeItemsWithoutStacks(buckets, [ATTRIBUTE, DATE]);
        const view = nonStackAttributes.slice(0, 1);

        if (nonStackAttributes.length > 0) {
            measures = getMeasureItems(limitNumberOfMeasuresInBuckets(buckets, 1));
        }

        if (nonStackAttributes.length > 1 && isEmpty(stacks)) {
            // first attribute is taken, find next available and put to stacks
            const attributesWithoutFirst = tail(nonStackAttributes);
            stacks = attributesWithoutFirst.slice(0, 1);
        }

        return { measures, view, stacks };
    }

    private getBucketItems(newReferencePoint: IReferencePoint) {
        const buckets = newReferencePoint?.buckets ?? [];
        let measures = getMeasureItems(buckets);
        let stacks = getStackItems(buckets);
        const nonStackAttributes = getAttributeItemsWithoutStacks(buckets);
        const view = nonStackAttributes.slice(0, 1);

        if (nonStackAttributes.length > 0) {
            measures = getMeasureItems(limitNumberOfMeasuresInBuckets(buckets, 1));
        }

        if (nonStackAttributes.length > 1 && isEmpty(stacks)) {
            // first attribute is taken, find next available non-date attribute
            const attributesWithoutFirst = tail(nonStackAttributes);
            const nonDate = attributesWithoutFirst.filter((attribute) => !isDateBucketItem(attribute));
            stacks = nonDate.slice(0, 1);
        }

        return { measures, view, stacks };
    }

    protected configureBuckets(newReferencePoint: IExtendedReferencePoint): void {
        const { measures, view, stacks } = this.isMultipleDatesEnabled()
            ? this.getBucketItemsWithMultipleDates(newReferencePoint)
            : this.getBucketItems(newReferencePoint);

        set(newReferencePoint, BUCKETS, [
            {
                localIdentifier: BucketNames.MEASURES,
                items: measures,
            },
            {
                localIdentifier: BucketNames.VIEW,
                items: view,
            },
            {
                localIdentifier: BucketNames.SEGMENT,
                items: stacks,
            },
        ]);
    }

    private getTreemapUIConfig(referencePoint: IReferencePoint) {
        const buckets = referencePoint?.buckets;
        const allowsMultipleDates = this.isMultipleDatesEnabled();
        const nonStackAttributes = allowsMultipleDates
            ? getAttributeItemsWithoutStacks(buckets, [ATTRIBUTE, DATE])
            : getAttributeItemsWithoutStacks(buckets);
        const measures = getMeasureItems(buckets);

        return getTreemapUiConfig(allowsMultipleDates, nonStackAttributes.length > 0, measures.length > 1);
    }

    public getExtendedReferencePoint(referencePoint: IReferencePoint): Promise<IExtendedReferencePoint> {
        const clonedReferencePoint = cloneDeep(referencePoint);
        let newReferencePoint: IExtendedReferencePoint = {
            ...clonedReferencePoint,
            uiConfig: this.getTreemapUIConfig(referencePoint),
        };

        newReferencePoint = removeAllArithmeticMeasuresFromDerived(newReferencePoint);
        newReferencePoint = removeAllDerivedMeasures(newReferencePoint);

        this.configureBuckets(newReferencePoint);

        newReferencePoint = setTreemapUiConfig(newReferencePoint, this.intl, this.type);
        newReferencePoint = configurePercent(newReferencePoint, false);
        newReferencePoint = configureOverTimeComparison(
            newReferencePoint,
            !!this.featureFlags["enableWeekFilters"],
        );
        newReferencePoint = getReferencePointWithSupportedProperties(
            newReferencePoint,
            this.supportedPropertiesList,
        );
        newReferencePoint = removeSort(newReferencePoint);

        return Promise.resolve(sanitizeFilters(newReferencePoint));
    }

    private addFilters(source: IInsight, drillConfig: IDrillDownDefinition, event: IDrillEvent) {
        const cutIntersection = reverseAndTrimIntersection(drillConfig, event.drillContext.intersection);
        return addIntersectionFiltersToInsight(source, cutIntersection);
    }

    public getInsightWithDrillDownApplied(source: IInsight, drillDownContext: IDrillDownContext): IInsight {
        const withFilters = this.addFilters(source, drillDownContext.drillDefinition, drillDownContext.event);
        return modifyBucketsAttributesForDrillDown(withFilters, drillDownContext.drillDefinition);
    }

    protected renderConfigurationPanel(insight: IInsightDefinition): void {
        if (document.querySelector(this.configPanelElement)) {
            render(
                <TreeMapConfigurationPanel
                    locale={this.locale}
                    references={this.references}
                    properties={this.visualizationProperties}
                    propertiesMeta={this.propertiesMeta}
                    insight={insight}
                    colors={this.colors}
                    pushData={this.handlePushData}
                    type={this.type}
                    isError={this.getIsError()}
                    isLoading={this.isLoading}
                    featureFlags={this.featureFlags}
                />,
                document.querySelector(this.configPanelElement),
            );
        }
    }
}
