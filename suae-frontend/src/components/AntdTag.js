/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {Tag} from 'antd';

export function AntdTag(props){
    const {type, ...rest}=props;
    const [tagType, setTagType] = React.useState(type);
    const types={
        danger:'#ff4d4f',
        info:'#2db7f5',
        success:'#87d068',
        primary:'#108ee9',
        warning:'#faad14',
    };

    React.useEffect(()=>{
        setTagType(type);
    }, [type]);

    return (
        <Tag color={types[tagType]} {...rest}>{props.children}</Tag>
    )
}