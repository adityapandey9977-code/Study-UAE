import React from 'react';
import util from "../utils/util";
//let $=window.$;

export function Input(props) {
    const {value, onChange, ...rest} = props;
    const [d, setData]=React.useState(value);
    React.useEffect(()=>{
        setData(value);
    }, [value]);
    
    return (
        <input value={d || ''} onChange={e=>setData(e.target.value)} {...rest} />
    );
}

export function If(props){
    const {cond, children} = props; return cond?(<>{children}</>):(<></>);
}

export function Paging(props){
    let c=props.pageob.cur_page;
    let s=props.pageob.page_start;
    let e=props.pageob.page_end;
    let total_pages=props.pageob.total_pages;
    let ranges=[];
    for(let i=s; i<=e; i++){
        ranges.push(i);
    }
    return (
        <ul className="pagination noselect m-0">
            <li className={'page-item '+(c<=1?'disabled':'')}>
                <a href="!#" className="page-link" onClick={(e)=>{e.preventDefault();props.fn(c-1)}}> &lt; </a>
            </li>

            {ranges.map(i=>(
                <li key={i} className={'page-item '+(c===i?'active':'')}>
                    <a href="!#" className="page-link" onClick={(e)=>{e.preventDefault();props.fn(i)}}> {i} </a>
                </li>
            ))}

            <li className={'page-item '+(c>=total_pages?'disabled':'')}>
                <a href="!#" className="page-link" onClick={(e)=>{e.preventDefault();props.fn(c+1)}}> &gt; </a>
            </li>
        </ul>
    );
}

export function Perpagedd(props){
    return (
        <select className="form-control" onChange={(e)=>props.fn(0, 1, e.target.value)}>
            {[25, 50, 100, 200, 500].map(ps=><option key={ps} value={ps}>Show {ps} Records</option>)}
        </select>
    );
}

export function Htmlvideo(props){
    return props.src?(
        <video className={props.className} id={props.id} autoPlay={props.autoPlay} controls>
            <source src={props.src} />
            Your browser does not support the video tag.
        </video>
    ):<></>;
}

export function RawHTML(props){
    let html = props && typeof props.html !== 'undefined' && props.html !== null ? props.html : '';
    if (typeof html !== 'string') {
        try {
            html = String(html);
        } catch (e) {
            html = '';
        }
    }
    html = html.replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html}}></div>;
}

export function Tinymce(props){
    const [initiated, setInitiated]=React.useState(false);

    const init=()=>{
        let height=props.height?props.height:300;
        let fullpage=props.fullpage?props.fullpage:false;

        window.tinymce.EditorManager.execCommand('mceRemoveEditor', true, props.id);
        window.tinymce.init({
            selector: "#"+props.id,
            height: height,
            menubar: false,
            //forced_root_block:'div',
            fontsize_formats: "8px 9px 10px 11px 12px 13px 14px 15px 16px 18px 20px 22px 24px 26px 28px 30px 36px 40px 50px",
            plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen '+(fullpage?'fullpage':''),
            'insertdatetime media table paste code', 'responsivefilemanager'
            ],
    
            //alignleft aligncenter alignright alignjustify
            toolbar: 'insert | styleselect | bold italic | fontselect fontsizeselect | forecolor backcolor | bullist numlist outdent indent | link unlink | image responsivefilemanager table | removeformat code | fullscreen',
            //content_css: '//www.tinymce.com/css/codepen.min.css',

            external_filemanager_path:util.apiUrl+"filemanager/",
            filemanager_title:"File Manager", //"Responsive Filemanager" ,
            external_plugins: { "filemanager" : util.apiUrl+"filemanager/plugin.min.js"},
            filemanager_crossdomain:true,
                
            paste_auto_cleanup_on_paste: true,
            paste_remove_styles: true,
            paste_remove_styles_if_webkit: true,
            paste_strip_class_attributes: true,
            
            valid_elements: '*[*]',
            
            relative_urls: false,
            remove_script_host: false,
            convert_urls: false,
            
            init_instance_callback:(editor)=>{
                editor.setContent(props.data || '');
                editor.getDoc().body.style.fontSize = '14px';
                setInitiated(true);
            }
        });
    }

    React.useEffect(()=>{
        init();
        // eslint-disable-next-line
    }, []);
    
    React.useEffect(()=>{
        if(initiated){
            window.tinymce.EditorManager.get(props.id).setContent(props.data || '');
        }
        // eslint-disable-next-line
    }, [props.data]);
    
    return <input type="text" id={props.id} name={props.name} />;
}

export function GetTinymceContent(id){
    return window.tinymce.get(id).getContent();
}

export function SetTinymceContent(id, data){
    window.tinymce.get(id).setContent(data);
}

export function SubmitTinymce(id){
    window.tinyMCE.triggerSave(false, true);
}

export function SvgPlusIcon(){
    return <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" role="img" aria-hidden="true" focusable="false"><path d="M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6zM10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6z"></path></svg>;
}

/** */
export function AmtFormat(props){
    let {amt}=props;
    amt=amt*1;
    let cinfo={no_of_decimal:3, currency:'KWD', currency_place:'After'}; //util.getCountryInfo();

    amt=amt.toFixed(cinfo.no_of_decimal || 2);
    if(cinfo.currency_place==='After'){
        amt=amt+' '+cinfo.currency;
    }else{
        amt=cinfo.currency+' '+amt;
    }
    return (
        <>
            {amt}
        </>
    )
}

export function NumFormat(props){
    let {num}=props;
    num=num*1;
    let cinfo={no_of_decimal:3, currency:'KWD', currency_place:'After'}; //util.getCountryInfo();
    if(props.dec){
        cinfo.no_of_decimal=props.dec;
    }

    num=num.toFixed(cinfo.no_of_decimal || 2);
    return (
        <>
            {num}
        </>
    )
}

export function PositiveNumInput(props){
    let inputRef=React.useRef();
    let {onChange, onEnter, type, ...rest}=props;
    const [value, setValue]=React.useState('');
    const getNum=(value)=>{
        return value.replace(/[^\d.-]/g,'');
    }
    
    const handleChange=(e)=>{
        let val=getNum(e.target.value);
        setValue(val);
        if(onChange){
            onChange(val, e);
        }
    }

    const onKeyPress=(e)=>{
        let value=getNum(e.target.value);
        if(e.charCode===13){
            if(typeof onEnter !== "undefined"){
                onEnter(value);
            }
            e.preventDefault();
        }
        if((value.indexOf(".")>=0 || type==='int') && e.charCode===46){
            e.preventDefault();
        }

        if(((e.charCode < 48 || e.charCode > 57) && (e.charCode < 96 || e.charCode > 105) && e.charCode!==190 && e.charCode!==110) && [8,9,36,37,38,39,40,46].indexOf(e.charCode)===-1){
            e.preventDefault();
        }
    }

    React.useEffect(()=>{
        setValue(props.value || '');
        // eslint-disable-next-line
    }, [props.value]);

    return(
        <>
            <input type="text" value={value} onChange={handleChange} onKeyPress={onKeyPress} ref={inputRef} {...rest} />
        </>
    )
}

export function BarcodeInput(props){
    let {onEnter, className, placeholder, ...rest} = props;
    const onKeyPress=(e)=>{
        if(e.charCode===32){
            e.preventDefault();
        }

        if(e.charCode===13){
            let barcode=e.target.value.trim();
            if(typeof onEnter !== "undefined"){
                onEnter(barcode);
            }
            e.preventDefault();
        }
    }

    React.useEffect(()=>{
        // eslint-disable-next-line
    }, []);

    return(
        <>
            <input 
                type="text" 
                className={"form-control "+className} 
                placeholder={placeholder || 'Barcode'} 
                onKeyPress={onKeyPress}
                {...rest} 
            />
        </>
    )
}