import React from 'react';

export function MaleUserIcon(props){
    const {...rest}=props;
    return <img src="theme/img/profile-pic-male.jpg" alt="" {...rest} />
}
export function FemaleUserIcon(props){
    const {...rest}=props;
    return <img src="theme/img/profile-pic-female.jpg" alt="" {...rest} />
}

export function DownArrowIcon(props){
    const {...rest}=props;
    return <img src="theme/img/down-arrow.svg" alt="" {...rest} />
}