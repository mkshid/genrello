function create_card(list_cards_div, board_id, list_id, card_id){
    /* Create a card

       Add card to the list node passed
       if the card_id is `tempcard` it's a tempcard

     */
    var card = list_cards_div._('div', {
        id: card_id,
        list_id: list_id,
        board_id: board_id,
        _class: 'list-card',
        connect_onclick: "show_card_details(this);",
        draggable: true,
        onDrag: function(dragValues, dragInfo, treeItem){
            var domNode = dragInfo.domnode;
            dragValues['card_pkey'] = domNode.id;
            dragValues['src_list_pkey'] = domNode.parentNode.id;
        }
    });
    if (card_id != list_id + '-tempcard'){
        card._('div', {
            innerHTML: '^.' + board_id + '.' + list_id + '.' + card_id + '.name',
            _class: 'list-card-label'
        });
    } else {
        card._('textArea', {
            value: '',
            board_id: board_id,
            list_id: list_id,
            _class: 'add-new-card-textarea',
            connect_onclick: function(e){
                e.stopPropagation();
            }
        });
    }
}

function show_card_details(that) {
    var card_id = that.getAttr('id');
    var list_id = that.getAttr('list_id');
    var board_id = that.getAttr('board_id');
    var card_dpath = '^board.' + board_id + '.' + list_id + '.' + card_id;
    

    var qd_width = screen.availWidth / 3 + 'px';
    var qd_height = screen.availHeight + 'px';


    var dlg = genro.dlg.quickDialog(
        card_dpath + '.name', {
            width: qd_width, height: qd_height,
            _class: 'show-card'
        }
    );

    var center = dlg.center;
    var box = center._('div', {
        padding:'10px',
    });

    var header_div = box._('div', {_class: 'card-header'})

    var title_bar = header_div._('div', {display: 'flex'})

    title_bar._('h2', {
        innerHTML: card_dpath + '.name', margin_top: '0px',
        width: '100%'});

    title_bar._('i', {
        _class: 'fa fa-times show-card-close',
        connect_onclick:dlg.close_action
    });

    var list_name_div = header_div._('div')
    var list_name = that.getRelativeData(card_dpath + '.list_name');

    list_name_div._('p', {innerHTML: 'in list ( ' + list_name + ' )',
                          color: '#c6c7c7'});

    var description = that.getRelativeData(card_dpath + '.description');

    if (description){
        box._('p', {
            innerHTML: card_dpath + '.description',
            card_dpath: card_dpath,
            card_id: card_id,
            connect_onclick: "edit_card_description(this);",
            _class: 'edit-card-description'
        });
    } else {
        box._('p', {
            innerHTML: 'Edit card description',
            card_dpath: card_dpath,
            card_id: card_id,
            connect_onclick: "edit_card_description(this);",
            _class: 'edit-card-description'
        });
    }

    // Add comment div
    var comments_div = box._('div', {_class:'add-comment-div'});
    comments_div._('h3', {innerHTML: 'Add Comment'});
    var comments_box = comments_div._('div', {_class: 'editing-box'})
    comments_box._('textArea', {
        value: card_dpath + '.new_comment',
        placeholder:'Write a comment...',
        connect_onkeyup: function(e){
            // Sets the right css on the `Send` btn
            var node = genro.nodeById('comment_send_btn');
            if(this.domNode.value.length > 0 ){
                node.updAttributes({_class:'save-btn'})
            } else {
                node.updAttributes({_class:'disabled-btn'})
            }
        }});

    var comments_ctrls = comments_div._('div', {_class: 'comment-controls'})
    comments_ctrls._('div', {innerHTML: 'Send', _class:'disabled-btn',
                             nodeId:'comment_send_btn'});

    dlg.show_action();
}



function create_new_card(that){
    /* Create a new card as `tempcard` */

    event.stopPropagation();

    attrs = that.getAttr()
    var list_id = attrs.list_id;
    var board_id = that.getRelativeData('board_id')

    that.domNode.innerHTML = '';
    that.domNode.className = '';

    var edit_control_div = that._(
        'div', {_class: 'edit-div-controls new-card'});

    edit_control_div._('div', {
        innerHTML: 'Save',
        _class: 'save-btn',
        list_id: list_id,
        board_id: board_id,
        connect_onclick: 'save_card(this, event);'
    });

    edit_control_div._('div', {
        _class: 'fa fa-times cancel-btn',
        edit_control_node: edit_control_div.getNode(),
        list_id: list_id,
        board_id: board_id,
        connect_onclick: function(e){

            e.stopPropagation();
            var attrs = this.getAttr()
            var node = attrs.edit_control_node;
            var list_id = attrs.list_id;
            var board_id = attrs.board_id;

            var parent_node = node.getParentNode();

            node.destroy();

            document.getElementById(list_id + '-tempcard').remove();
            // set the tempcard in store to null
            that.setRelativeData('board.' + board_id + '.' + list_id + '.tempcard', null);

            parent_node._('div', {
                innerHTML:'Add a card...',
                _class: 'add-new-card',
                list_id: list_id
            });

        }

    });


    var board_id = that.getRelativeData('board_id')
    var list_cards_div = genro.nodeById(list_id);
    var card_creating = that.getRelativeData(
        'board.' + board_id + '.' + list_id + '.tempcard'
    );

    if (card_creating == null){
        that.setRelativeData('board.' + board_id + '.' + list_id + '.tempcard', true);
        create_card(list_cards_div, board_id, list_id, list_id + '-tempcard');
    }
}


function save_card(that, event){
    /* Save the new card once enter is pressed  */

    var board_id = that.getRelativeData('board_id');
    var list_id = that.getAttr('list_id');

    var tempcard_div = document.getElementById(list_id + '-tempcard');

    // In this case the firstChild is the textarea of tempcard
    var value = tempcard_div.firstChild.value;

    // In case of enter save the card
    var card = genro.serverCall('save_card', {
        list_id: list_id,
        card_name: value
    });

    var card_id = card.getItem('id');
    // Sets the saved card in store
    that.setRelativeData(
        'board.' + board_id + '.' + list_id + '.' + card_id,
        card
    );

    var list_cards_div = genro.nodeById(list_id);
    // remove the temp  card
    document.getElementById(list_id + '-tempcard').remove();
    // set the tempcard in store to null
    that.setRelativeData('board.' + board_id + '.' + list_id + '.tempcard', null);
    // create the new saved card
    create_card(list_cards_div, board_id, list_id, card_id);

}

function edit_card_description(that, event){

    var domnode = that.domNode;
    var pre_editclass = domnode.className;
    var pre_edit_value = domnode.innerText;
    var list_id = that.getAttr('list_id');
    var card_id = that.getAttr('card_id');
    var board_id = that.getRelativeData('board_id');
    var card_dpath = that.getAttr('card_dpath');

    domnode.innerText = '';
    domnode.className = '';

    function remove_edit_wdg(edit_wdg_node, descr_node,
                             value, sty_class) {

        edit_wdg_node.getParentNode().destroy();
        descr_node.innerHTML = value;
        descr_node.className = sty_class;
    }

    var card_edit_div = that._(
        'div', {
            connect_onclick: function(e){
                e.stopPropagation();
            }
        }
    );
    var textarea_wdg = card_edit_div._('TextArea', {
        innerHTML: card_dpath + '.description',
        _class: 'edit-card-description-textarea',
    });
    var edit_control_div = card_edit_div._(
        'div', {_class: 'edit-div-controls'});

    edit_control_div._('div', {
        innerHTML: 'Save',
        card_id: card_id,
        card_dpath: card_dpath,
        textarea_node: textarea_wdg.getNode(),
        descr_domnode: domnode,
        pre_editclass: pre_editclass,
        _class: 'save-btn',
        connect_onclick: function(e){
            var card_id = this.getAttr('card_id');
            var textarea_node = this.getAttr('textarea_node');
            var descr = textarea_node.domNode.value;

            var descr_domnode = this.getAttr('descr_domnode');
            var pre_editclass = this.getAttr('pre_editclass');

            var result = genro.serverCall(
                'update_card_description',
                {
                    card_id: card_id,
                    description: descr
                }
            );
            if (result){
                genro.publish(
                    'floating_message',
                    {message: 'Card description saved!'});
                this.setRelativeData(card_dpath + '.description', descr);

                remove_edit_wdg(textarea_node, descr_domnode,
                                descr, pre_editclass);

            }
        }
    });

    edit_control_div._('div', {
        _class: 'fa fa-times cancel-btn',
        textarea_node: textarea_wdg.getNode(),
        descr_domnode: domnode,
        pre_editclass: pre_editclass,
        pre_edit_value: pre_edit_value,
        connect_onclick: function(e){
            var attrs = this.getAttr();
            remove_edit_wdg(
                attrs.textarea_node, attrs.descr_domnode,
                attrs.pre_edit_value, attrs.pre_editclass
            );
        }
    });

}
