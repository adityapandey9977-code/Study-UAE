class TinymceSpeechRecogLib {
    constructor() {
        this.editor = null;
        this.text = '';
        this.isStarted = false;
        this.lettercase = '';
        this.texts = [];
        this.lang = 'en-US';
        this.recognition = null;

        this.onResult = () => { };
        this.languages = ['en-US', 'en-UK', 'fr-BE', 'it-IT', 'hi-IN', 'pt-PT'];
        this.commands = ["Go to Last", "Space", "Full Stop", "Bracket Spen", "Bracket Close", "Question Mark", "Heading", "Bold", "Italic", "Underline", "New Line", "New Paragraph", "Delete", "Delete Right", "Align Left", "Align Center", "Align Right", "Undo", "Redo"];
    }

    init(editor) {
        try {
            this.editor = editor;
            window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new window.SpeechRecognition();
            this.recognition.interimResults = true;
            this.recognition.lang = this.lang;
            this.recognition.addEventListener('result', e => {
                this.text = Array.from(e.results).map(result => result[0]).map(result => result.transcript).join('');
                this.onResult(this.text);
            });

            return true;
        } catch (e) {
            return e;
        }
    }

    startRecognition() {
        if (!this.recognition) {
            return;
        }

        try {
            this.isStarted = true;
            this.text = '';
            this.recognition.start();
            this.recognition.addEventListener(
                'end',
                () => {
                    if (!this.isStarted) {
                        return;
                    }
                    if (this.text) {
                        let action = this.text.toLowerCase().replace(/\s/g, '');
                        switch (action) {
                            case 'gotolast':
                                this.editor.selection.select(this.editor.getBody(), true);
                                this.editor.selection.collapse(false);
                                break;

                            case 'space':
                                this.setTextToTinymce(" ");
                                break;

                            case 'fullstop':
                                this.setTextToTinymce(".");
                                break;

                            case 'bracketopen':
                                this.setTextToTinymce("(");
                                break;

                            case 'bracketclose':
                                this.setTextToTinymce(")");
                                break;

                            case 'questionmark':
                                this.setTextToTinymce("?");
                                break;

                            case 'bold':
                                this.editor.execCommand('Bold');
                                break;
                            case 'italic':
                                this.editor.execCommand('Italic');
                                break;
                            case 'underline':
                                this.editor.execCommand('Underline');
                                break;

                            case 'newline':
                                this.editor.execCommand('InsertLineBreak');
                                break;
                            case 'newparagraph':
                                this.editor.execCommand('mceInsertNewLine');
                                break;
                            case 'heading':
                                let id = "h" + (new Date().getTime());
                                this.editor.execCommand('mceInsertRawHTML', false, `<h1 id="${id}"></h1>`);
                                var newNode = this.editor.dom.select('#' + id);
                                this.editor.selection.select(newNode[0], true);
                                this.editor.selection.setContent("");
                                break;

                            case 'delete':
                                this.editor.execCommand('Delete');
                                break;
                            case 'deleteright':
                                this.editor.execCommand('ForwardDelete');
                                break;

                            case 'alignleft':
                            case 'alignedleft':
                                this.editor.execCommand('JustifyLeft');
                                break;
                            case 'aligncenter':
                            case 'aligncentre':
                            case 'alignedcenter':
                            case 'alignedcentre':
                                this.editor.execCommand('JustifyCenter');
                                break;
                            case 'alignright':
                            case 'alignedright':
                                this.editor.execCommand('JustifyRight');
                                break;

                            case 'undo':
                                this.editor.undoManager.undo();
                                this.texts.splice(this.texts.length - 1, 1);
                                break;
                            case 'redo':
                                this.editor.undoManager.redo();
                                break;


                            default:
                                this.setTextToTinymce(this.text);
                        }
                    }
                    try {
                        this.recognition.start();
                    } catch (e) {
                        return e;
                    }
                    this.text = '';
                    this.onResult('');
                }
            );

            return true;
        } catch (e) {
            return e;
        }
    }

    stopRecognition() {
        if (this.recognition) {
            this.isStarted = false;
            this.recognition.stop();
        }
        return true;
    }

    setLang(lang) {
        this.lang = lang;
        if (this.recognition) {
            this.recognition.lang = lang;
        }
        this.stopRecognition();
        this.init(this.editor);
    }

    setTextToTinymce(text) {
        /* let n=this.texts.length;
        console.log(texts, n)
        if(n===0 || (this.texts[n-1]===" " && (this.texts[n-2]==="." || this.texts[n-2]==="?"))){
            this.text=this.text.charAt(0).toUpperCase() + this.text.slice(1);
        } */

        this.editor.focus();
        this.editor.insertContent(text);
        //this.editor.execCommand('mceInsertContent', false, text);
        //this.texts.push(text);
    }
}

export default new TinymceSpeechRecogLib();