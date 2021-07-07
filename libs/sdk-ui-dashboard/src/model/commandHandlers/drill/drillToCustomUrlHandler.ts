// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { internalErrorOccurred } from "../../events/general";
import { DrillToCustomUrl } from "../../commands/drill";
import { DashboardDrillToCustomUrlTriggered, drillToCustomUrlTriggered } from "../../events/drill";
import { resolveDrillToCustomUrl } from "./resolveDrillToCustomUrl";

export function* drillToCustomUrlHandler(
    ctx: DashboardContext,
    cmd: DrillToCustomUrl,
): SagaIterator<DashboardDrillToCustomUrlTriggered> {
    // eslint-disable-next-line no-console
    console.debug("handling drill to custom url", cmd, "in context", ctx);

    try {
        const resolvedUrl = yield call(
            resolveDrillToCustomUrl,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent.widgetRef!,
            cmd.payload.drillEvent,
            ctx,
        );

        return drillToCustomUrlTriggered(
            ctx,
            resolvedUrl,
            cmd.payload.drillDefinition,
            cmd.payload.drillEvent,
            cmd.correlationId,
        );
    } catch (e) {
        throw internalErrorOccurred(
            ctx,
            "An unexpected error has occurred while drilling to attribute url",
            e,
            cmd.correlationId,
        );
    }
}
