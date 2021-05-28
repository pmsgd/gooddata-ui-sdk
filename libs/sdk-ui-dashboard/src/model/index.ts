// (C) 2021 GoodData Corporation

/*
 * The public API of the Dashboard model is exported from here.
 *
 * What is exported:
 *
 * -  hooks do dispatch commands / call selectors
 * -  all selectors & the typing of state with which they work
 * -  all events & their types. Note: event factories are not exported on purpose. outside code should not be
 *    creating events
 * -  all commands, their types & command factories
 */

export {
    useDashboardSelector,
    useDashboardDispatch,
    DashboardDispatch,
    DashboardState,
} from "./state/dashboardStore";

export { loadingSelector } from "./state/loading/loadingSelectors";
export { LoadingState } from "./state/loading/loadingState";
export { ConfigState } from "./state/config/configState";
export {
    configSelector,
    localeSelector,
    separatorsSelector,
    settingsSelector,
} from "./state/config/configSelectors";
export { PermissionsState } from "./state/permissions/permissionsState";
export { permissionsSelector } from "./state/permissions/permissionsSelectors";
export { FilterContextState } from "./state/filterContext/filterContextState";
export { filterContextSelector } from "./state/filterContext/filterContextSelectors";
export { LayoutState } from "./state/layout/layoutState";
export { layoutSelector } from "./state/layout/layoutSelectors";
export { DateFilterConfigState } from "./state/dateFilterConfig/dateFilterConfigState";
export {
    dateFilterConfigSelector,
    effectiveDateFilterConfigSelector,
    effectiveDateFilterCustomTitleSelector,
    effectiveDateFilterModeSelector,
} from "./state/dateFilterConfig/dateFilterConfigSelectors";
export { insightsSelector } from "./state/insights/insightsSelectors";
export { CatalogState } from "./state/catalog/catalogState";

export { DashboardContext, DashboardConfig, ResolvedDashboardConfig } from "./types/commonTypes";
export { DateFilterConfigValidationResult } from "./_staging/dateFilterConfig/validation";

export * from "./commands";
export * from "./events";
export { DashboardEventHandler } from "./events/eventHandler";