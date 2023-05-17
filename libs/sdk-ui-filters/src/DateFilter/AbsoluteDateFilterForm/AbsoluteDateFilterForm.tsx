// (C) 2007-2022 GoodData Corporation
import React from "react";
import { DayPickerRangeProps } from "react-day-picker";
import { IAbsoluteDateFilterForm, WeekStart } from "@gooddata/sdk-model";

import { DateRangePicker, IDateRange } from "../DateRangePicker/DateRangePicker";
import { IExtendedDateFilterErrors, DateFilterOption } from "../interfaces";

import { dateFilterValueToDateRange, dateRangeToDateFilterValue } from "./conversions";

/**
 * @internal
 */
export interface IAbsoluteDateFilterFormProps {
    dateFormat: string;
    selectedFilterOption: IAbsoluteDateFilterForm;
    isMobile: boolean;
    errors: IExtendedDateFilterErrors["absoluteForm"];
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    isTimeEnabled: boolean;
    weekStart?: WeekStart;
}

const dayPickerProps: DayPickerRangeProps = {
    mode: "range",
    weekStartsOn: 0, // Sunday, regardless of locale
};

/**
 * @internal
 */
export class AbsoluteDateFilterForm extends React.Component<IAbsoluteDateFilterFormProps> {
    public render() {
        const { dateFormat, isMobile, selectedFilterOption, errors, isTimeEnabled, weekStart } = this.props;
        return (
            <DateRangePicker
                dateFormat={dateFormat}
                onRangeChange={this.handleRangeChange}
                range={dateFilterValueToDateRange(selectedFilterOption, isTimeEnabled)}
                errors={errors}
                isMobile={isMobile}
                dayPickerProps={dayPickerProps}
                isTimeEnabled={isTimeEnabled}
                weekStart={weekStart}
            />
        );
    }

    private handleRangeChange = (range: IDateRange): void => {
        const { selectedFilterOption, isTimeEnabled } = this.props;
        this.props.onSelectedFilterOptionChange(
            dateRangeToDateFilterValue(range, selectedFilterOption.localIdentifier, isTimeEnabled),
        );
    };
}
