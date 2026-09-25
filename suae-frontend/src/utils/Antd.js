/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
    Select,
    DatePicker,
    Pagination,
    Tag,
    Checkbox
} from 'antd';

export function AntdSelect(props) {
    let {
        placeholder,
        options,
        value,
        sort,
        getPopupContainer,
        ...rest
    } = props;

    if (value === undefined || value === null || value === '') {
        value = null;
    } else if (typeof value !== "object") {
        value = value + '';
    }

    if (typeof options !== "object") {
        options = [];
    }
    if (typeof options[0] !== "object") {
        let ops = [...options];
        options = [];
        for (let ind in ops) {
            options.push({ value: ops[ind], label: ops[ind] });
        }
    }
    if (typeof options[0]?.value === "undefined") {
        let ops = [...options];
        options = [];
        ops.forEach(v => {
            options.push({ value: v.id, label: v.title || v.name });
        })
    }

    options.forEach(v => {
        v.value += '';
        v.label += '';
    })

    if (sort) {
        options.sort((a, b) => {
            return ('' + a.label).localeCompare(b.label);
        })
    }

    return (
        <>
            <Select
                style={{ width: '100%' }}
                placeholder={placeholder || "Select"}
                options={options}
                value={(value !== null && typeof value !== "undefined") ? (value) : null}
                placement="bottomLeft"
                listHeight={400}
                virtual={false}
                getPopupContainer={(triggerNode) => triggerNode.closest('.overflow-auto') || triggerNode.closest('.page-content') || document.body}
                dropdownAlign={{
                    points: ['tl', 'bl'],
                    offset: [0, 8],
                    overflow: { adjustX: true, adjustY: false }
                }}
                filterOption={
                    (input, option) => {
                        return (option?.label || '').toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                }

                {...rest}
            >
            </Select>
        </>
    )
}

/* How to use: 
    <AntdSelect
        options={[{value:1, label:"Title1"}, {value:2, label:"Title2"}, {value:3, label:"Title3"}]}
        showSearch
        allowClear
        onChange={e=>{
            console.log(e)
        }}
    /> 
*/

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

export function AntdPaging(props) {
    let { onChange, onShowSizeChange, total, pageSize, defaultPageSize, ...rest } = props;
    let jumpOn1st = false;

    // Use pageSize if provided, otherwise use defaultPageSize, otherwise fallback to 100
    const initialPageSize = pageSize || defaultPageSize || 100;

    const handlePaseSizeChange = (current, size) => {
        jumpOn1st = true;
        if (onShowSizeChange) {
            onShowSizeChange(current, size);
        } else if (onChange) {
            onChange(1, size); // Always go to first page when changing page size
        }
    }

    const handleOnChange = (page, size) => {
        if (onChange) {
            onChange(jumpOn1st ? 1 : page, size);
        }
        jumpOn1st = false;
    }

    return (
        <Pagination
            defaultCurrent={1}
            total={total}
            pageSize={initialPageSize}
            defaultPageSize={initialPageSize}
            pageSizeOptions={['10', '25', '50', '100', '200', '500']}
            onChange={handleOnChange}
            onShowSizeChange={handlePaseSizeChange}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            {...rest}
        />
    )
}

export function AntdTag(props) {
    const { type, style, color, ...rest } = props;
    const [tagType, setTagType] = React.useState(type);
    const types = {
        danger: '#ff4d4f',
        info: '#2db7f5',
        success: '#87d068',
        primary: '#108ee9',
    };

    React.useEffect(() => {
        setTagType(type);
    }, [type]);

    let customStyle = {};
    let tagColor = color || types[tagType];

    if (tagType === 'success') {
        customStyle = {
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            borderColor: '#15803d',
            fontWeight: 600,
            borderRadius: 4
        };
        tagColor = undefined;
    } else if (tagType === 'danger') {
        customStyle = {
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            borderColor: '#b91c1c',
            fontWeight: 600,
            borderRadius: 4
        };
        tagColor = undefined;
    }

    const mergedStyle = { ...customStyle, ...style };

    return (
        <Tag color={tagColor} style={mergedStyle} {...rest}>{props.children}</Tag>
    );
}

export function MultiChechBox(props) {
    const type = typeof props.value === 'object' ? 'array' : 'string';
    let options = props.options;
    options = options.map(v => {
        if (v.value) {
            return { value: v.value * 1, label: v.label }
        }
        if (v.id) {
            return { value: v.id * 1, label: v.name }
        }
        return null;
    })

    let [values, setValues] = useState();
    const handleChange = (e) => {
        if (e.target.checked) {
            values.push(e.target.value * 1)
            setValues([...values]);
        } else {
            if (values.indexOf(e.target.value) > -1) {
                values.splice(values.indexOf(e.target.value), 1);
                setValues([...values])
            }
        }
    }

    useEffect(() => {
        if (type === 'string') {
            values = props.value ? props.value.split(',').map((v) => v * 1) : [];
            setValues([...values]);
        } else {
            setValues([...props.value]);
        }
    }, []);

    useEffect(() => {
        if (type === 'string') {
            props.onChange(values?.join());
        } else {
            props.onChange(values)
        }
    }, [values])

    return (
        <>
            {
                options.map((v, i) => (
                    <Checkbox
                        value={v.value * 1}
                        checked={values?.includes(v.value * 1)}
                        key={i}
                        onChange={handleChange}
                        className="mx-0 mr15"
                    >
                        {v.label}
                    </Checkbox>
                ))
            }
        </>

    );
}