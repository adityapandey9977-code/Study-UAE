/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';

export function RawHTML(props){
    let html=props.html.replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html}}></div>;
}