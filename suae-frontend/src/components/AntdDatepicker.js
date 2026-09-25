/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';

export function AntdDatepicker(props) {
    let {
        format,
        inputReadOnly,
        value,
        defaultValue,
        onChange,
        ...rest
    } = props;

    let otherProps = {};
    if (typeof value !== "undefined") {
        otherProps.value = value ? moment(new Date(value)) : null
    }
    if (typeof defaultValue !== "undefined") {
        otherProps.defaultValue = defaultValue ? moment(new Date(defaultValue)) : null
    }
    if (typeof onChange !== "undefined") {
        otherProps.onChange = (dt) => {
            onChange(dt ? moment(dt).format(format || 'DD MMM YYYY') : null);
        }
    }

    return (
        <DatePicker
            format={format || 'DD MMM YYYY'}
            inputReadOnly={inputReadOnly || true}
            {...otherProps}
            {...rest}
            style={{ width: '100%' }}
            placement="bottomLeft"
            getPopupContainer={(triggerNode) => triggerNode.closest('.overflow-auto') || triggerNode.closest('.page-content') || document.body}
        />
    )
}