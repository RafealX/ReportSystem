/**
 * 富文本编辑组件
 */
import React from 'react';
import scss from './index.scss';

export default React.createClass({
    shouldComponentUpdate() {
        return false;
    },
    componentDidMount() {
        this.innerDoc = this._getDoc();
        this.innerDoc.body.contentEditable = true;
        this.innerDoc.head.innerHTML = '<style>body{font-size: 14px; line-height:1.5em;color: #555;}ul,ol{padding-left: 25px;}</style>';
        this.innerDoc.body.innerHTML = this.props.initContent || '';
        this.innerDoc.onselectionchange = this._selectionChange;
        this.innerDoc.body.focus();
    },
    render() {
        return (
            <div className={scss.index}>
                <iframe ref="iframe" src="about:blank;"></iframe>
            </div>
        );
    },
    _getDoc() {
        return this.refs.iframe.contentDocument;
    },
    _exec(cmd, param) {
        this.innerDoc.execCommand(cmd, false, param);
        this.innerDoc.body.focus();
    },
    _selectionChange() {
        if (this.props.onSelectionChange) {
            this.props.onSelectionChange(this.getFormat());
        }
    },
    insertOrderedList() {
        this._exec('insertorderedlist');
    },
    insertUnorderedList() {
        this._exec('insertunorderedlist');
    },
    heading(type) {
        this._exec('formatBlock', `<${type}>`);
    },
    removeFormat() {
        let selection = this.innerDoc.getSelection();
        let parent = selection.focusNode;
        let focusToEnd = node => {
            var range = this.innerDoc.createRange();
            range.setStartBefore(node);
            range.setEndBefore(node);
        };
        while (parent) {
            if (/^h\d$/i.test(parent.tagName)) {
                let tmpNode = document.createElement('div');
                tmpNode.innerHTML = parent.innerHTML;
                parent.parentNode.replaceChild(tmpNode, parent);
                focusToEnd(tmpNode);
                break;
            } else if (/^li$/i.test(parent.tagName)) {
                let wrap = parent.parentNode;
                let tmpNode = document.createElement('div');
                tmpNode.innerHTML = parent.innerHTML;
                let nextNodes = [];
                let next = parent.nextSibling;
                while (next) {
                    nextNodes.push(next);
                    next = next.nextSibling
                }
                [parent].concat(nextNodes).forEach(n => wrap.removeChild(n));
                wrap.insertAdjacentElement('afterEnd', tmpNode);
                if (nextNodes.length) {
                    let nextEle = document.createElement(wrap.tagName);
                    nextEle.innerHTML = nextNodes.map(n => n.outerHTML).join('\n');
                    tmpNode.insertAdjacentElement('afterEnd', nextEle);
                }
                focusToEnd(tmpNode);
                break;
            } else {
                parent = parent.parentNode;
            }
        }
    },
    getContent() {
        return this.innerDoc.body.innerHTML;
    },
    getFormat() {
        let selection = this.innerDoc.getSelection();
        let parent = selection.focusNode;
        let type = '';
        while (parent) {
            if (/^h\d$/i.test(parent.tagName)) {
                type = parent.tagName;
                break;
            } else if (/^li$/i.test(parent.tagName)) {
                type = parent.parentNode.tagName;
                break;
            } else {
                parent = parent.parentNode;
            }
        }
        return type.toLowerCase();
    }
});