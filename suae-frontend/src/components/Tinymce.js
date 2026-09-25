/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import FileService from '../services/FileService';
import { Spin } from 'antd';

export function Tinymce(props) {
    const initiated = useRef(false);
    const interval = useRef(false);

    const [loading, setLoading] = useState(true);

    function retrieveImageFromClipboardAsBlob(pasteEvent) {
        if (pasteEvent.clipboardData === false) {
            return false;
        }

        var items = pasteEvent.clipboardData.items;

        if (items === undefined) {
            return false;
        }

        for (var i = 0; i < items.length; i++) {
            // Only paste if image is only choice
            if (items[i].type.indexOf("image") === -1) {
                return false;
            }
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            // load image if there is a pasted image
            if (blob !== null) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    // console.log('result', e.target.result);
                };
                reader.readAsDataURL(blob);
                return blob;
            }
        }
        return false;
    }

    async function uploadImage(imageBlob, editor) {
        setLoading(true);
        try {
            let rs = await FileService.upload(imageBlob, 1200);
            editor.insertContent('<img src="' + rs.data.file_url + '" />');
        } catch (e) {
        }
        setLoading(false);
    }

    const init = () => {
        let { height, fullpage, menubar } = props;
        height = height || 300;
        fullpage = fullpage || false;

        window.tinymce.EditorManager.execCommand('mceRemoveEditor', true, props.id);

        let configOb = {
            selector: "#" + props.id,
            height: height,
            menubar: menubar ? 'edit view insert format table' : false,
            //forced_root_block:'div',
            fontsize_formats: "8px 9px 10px 11px 12px 13px 14px 15px 16px 18px 20px 22px 24px 26px 28px 30px 36px 40px 50px",

            plugins: [
                'advlist autolink lists link image charmap print preview anchor emoticons',
                'searchreplace visualblocks code fullscreen ' + (fullpage ? 'fullpage' : ''),
                'insertdatetime media table paste code'
            ],
            //styleselect, blockquote, h1 h2 h3 h4, cut copy paste
            toolbar1: `undo redo | styleselect | fontselect | fontsizeselect | bold italic underline strikethrough superscript subscript | alignleft aligncenter alignright alignjustify | searchreplace | forecolor backcolor | emoticons charmap | bullist numlist | outdent indent | link unlink | image table | removeformat code | fullscreen`,


            content_css: 'assets/tinymce-new/custom.css',

            paste_auto_cleanup_on_paste: true,
            paste_remove_styles: true,
            paste_remove_styles_if_webkit: true,
            paste_strip_class_attributes: true,
            paste_data_images: true,
            paste_as_text: true,

            valid_elements: '*[*]',

            relative_urls: false,
            remove_script_host: false,
            convert_urls: false,

            init_instance_callback: (editor) => {
                //editor.setContent(props.data || '');
                editor.getDoc().body.style.fontSize = '14px';
                initiated.current = true;
                setLoading(false);

                if (props.onInit) {
                    props.onInit(editor);
                }
            },

            setup: function (editor) {
                editor.on('paste', function (e) {
                    try {
                        var imageBlob = retrieveImageFromClipboardAsBlob(e);
                        if (imageBlob) {
                            e.preventDefault();
                            uploadImage(imageBlob, editor)
                        }
                    } catch (e) {
                        e.preventDefault();
                    }
                });
            }
        };

        window.tinymce.init(configOb);
    }

    useEffect(() => {
        if (interval.current) {
            clearInterval(interval.current);
        }
        try {
            if (initiated.current) {
                window.tinymce.EditorManager.get(props.id).setContent(props.data || '');
            } else {
                interval.current = setInterval(() => {
                    //console.log('saty interval', new Date().toTimeString(), props.data, initiated.current);
                    if (initiated.current) {
                        window.tinymce.EditorManager.get(props.id).setContent(props.data || '');
                        clearInterval(interval.current);
                    }
                }, 200);
            }
        } catch (e) {
            console.log("tinymce", e);
        }
    }, [props.data]);

    useEffect(() => {
        setTimeout(init, 0);
        //init();

        return () => {
            try {
                window.tinymce.get(props.id).remove();
            } catch (e) {
            }

            if (interval.current) {
                clearInterval(interval.current);
            }
        }
    }, []);

    return (
        <Spin tip="Loading" spinning={loading}>
            <input type="text" id={props.id} name={props.name} />
        </Spin>
    );
}

export function GetTinymceContent(id) {
    return window.tinymce.get(id).getContent();
}

export function SetTinymceContent(id, data) {
    window.tinymce.get(id).setContent(data);
}

export function SubmitTinymce(id) {
    window.tinyMCE.triggerSave(false, true);
}