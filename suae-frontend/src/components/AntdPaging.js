/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {Pagination} from 'antd';

export function AntdPaging(props) {
    let { onChange, total, pageSize, ...rest } = props;
    let jumpOn1st = false;
    const handlePaseSizeChange = (n, ps) => {
        jumpOn1st = true;
    }

    const handleOnChange = (n, ps) => {
        onChange(jumpOn1st ? 1 : n, ps);
        jumpOn1st = false;
    }

    return (
        <Pagination
            defaultCurrent={1}
            total={total}
            defaultPageSize={pageSize || 25}
            pageSizeOptions={[10, 20, 25, 50, 100]}
            onChange={handleOnChange}
            onShowSizeChange={handlePaseSizeChange}
            {...rest}
        />
    )
}