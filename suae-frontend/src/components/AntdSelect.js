/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { Select } from 'antd';

export function AntdSelect(props) {
    let {
        placeholder,
        options,
        value,
        sort,
        ...rest
    } = props;

    if (!value && value !== 0) {
        value = null;
    } else if (value + '' && typeof value !== "object") {
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
                    points: ['tl', 'bl'], // Align dropdown's top-left to trigger's bottom-left
                    offset: [0, 8],
                    overflow: { adjustX: true, adjustY: false }, // Prevent flipping to top
                }}
                filterOption={
                    (input, option) => {
                        if (!input) return true;
                        const searchText = input.toLowerCase().trim();
                        const label = (option.label || '').toLowerCase();
                        // Enhanced search: matches from start of words or anywhere in the label
                        return label.includes(searchText) ||
                            label.split(' ').some(word => word.startsWith(searchText));
                    }
                }
                optionFilterProp="label"
                showSearch={rest.showSearch !== false}
                filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
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