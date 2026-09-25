import { Link } from 'react-router-dom';

export default function Tabs(props) {
    let tabs = [
        { k: 'roles', lbl: 'Roles' },
        { k: 'users', lbl: 'Users' },
    ];
    return (
        <ul className="nav nav-tabs uc tabs-sm1">
            {tabs.map((v, i) => (
                <li key={i} className="nav-item">
                    <Link className={"nav-link " + (v.k === props.active ? 'active' : '')} to={"/" + v.k} data-toggle="pill">
                        {v.lbl}
                    </Link>
                </li>
            ))}
        </ul>
    )
}

export function PageHeading() {
    return (
        <><i className="fa fa-user-shield"></i> Roles &amp; Users</>
    );
}