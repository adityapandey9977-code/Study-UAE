import React from 'react';
import util from '../../utils/util';
import ClientDash from './ClientDash';
import StudentDash from './StudentDash';
import StuDashTop from './StuDashTop';
import InstituteDash from './InstituteDash';
import './style.css';

export default function Index(){
    return(
        <div className="page-content">
            {util.isStudent()===1?(
                <StuDashTop active={1} />
            ): null}

            <div className="page-pad">
                {util.getUserType()==='CLIENT' &&
                    <ClientDash />
                }

                {util.isStudent()===1 &&
                    <StudentDash />
                }

                {util.isInstitute()===1 &&
                    <InstituteDash />
                }
            </div>
        </div>
    )
}