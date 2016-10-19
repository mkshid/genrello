function generate_board_page(that){
    /* Main function that generate the board page */


    var board_id = that.getAttr('board_id')
    // Set opened board_id in the store
    that.setRelativeData('board_id', board_id);

    // Gets the node of board page
    var bp_node = that.nodeById('board_page');

    bp_node.clearValue().freeze();

    // Make a serverCall to gets lists and cards related
    // to the board.
    var result = genro.serverCall(
        'get_lists_cards',
        {board_id: board_id}
    );

    // sets the return result to the board datapath
    that.setRelativeData('board.'+ board_id, result);

    var res_asDict = result.asDict(true);
    for (var list_id in res_asDict){
        var cards = res_asDict[list_id];
        create_list(bp_node, board_id, list_id, cards);
    }

    create_add_new_list_div(bp_node);

    bp_node.unfreeze();

    // Once done with the rendering change the page
    that.setRelativeData('page_selected', 1);
}


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
    if (card_id != 'tempcard'){
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
            connect_onkeyup: "var that=this; save_card(that, event);"
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

    var title_bar = box._('div', {display: 'flex'})

    title_bar._('h2', {
        innerHTML: card_dpath + '.name', margin_top: '0px',
        width: '100%'});

    title_bar._('i', {
        _class: 'fa fa-times show-card-close',
        connect_onclick:dlg.close_action
    });

    box._('h6', {innerHTML: card_dpath + '.list_name'});

    var description = that.getRelativeData(card_dpath + '.description');

    if (description){
        box._('p', {
            innerHTML: card_dpath + '.description',
            card_dpath: card_dpath,
            connect_onclick: "edit_card_description(this);",
            _class: 'edit-card-description'
        });
    } else {
        box._('p', {
            innerHTML: 'Edit card description',
            card_dpath: card_dpath,
            connect_onclick: "edit_card_description(this);",
            _class: 'edit-card-description'
        });
    }

    dlg.show_action();
}



function create_new_card(that){
    /* Create a new card as `tempcard` */

    var list_id = that.getAttr('list_id');
    var board_id = that.getRelativeData('board_id')
    var list_cards_div = genro.nodeById(list_id);
    var card_creating = that.getRelativeData(
        'board.' + board_id + '.' + list_id + '.tempcard'
    );

    if (card_creating == null){
        that.setRelativeData('board.' + board_id + '.' + list_id + '.tempcard', true);
        create_card(list_cards_div, board_id, list_id, 'tempcard');
    }
}


function save_card(that, event){
    /* Save the new card once enter is pressed  */

    var board_id = that.getRelativeData('board_id');
    var list_id = that.getAttr('list_id');
    if (event.keyCode == 13){
        // In case of enter save the card
        var card = genro.serverCall('save_card', {
            list_id: list_id,
            card_name: that.domNode.value
        });

        var card_id = card.getItem('id');
        // Sets the saved card in store
        that.setRelativeData(
            'board.' + board_id + '.' + list_id + '.' + card_id,
            card
        );

        var list_cards_div = genro.nodeById(list_id);
        // remove the temp  card
        document.getElementById('tempcard').remove();
        // set the tempcard in store to null
        that.setRelativeData('board.' + board_id + '.' + list_id + '.tempcard', null);
        // create the new saved card
        create_card(list_cards_div, board_id, list_id, card_id);

    } else if (event.keyCode == 27){
        // In case of esc remove the card div
        document.getElementById('tempcard').remove();
    }
}
function edit_card_description(that, event){

    var domnode = that.domNode;
    var pre_editclass = domnode.className;
    var pre_edit_value = domnode.innerText;
    var list_id = that.getAttr('list_id');
    var board_id = that.getRelativeData('board_id');
    var card_dpath = that.getAttr('card_dpath');

    domnode.innerText = '';
    domnode.className = '';

    var card_edit_div = that._('div');
    card_edit_div._('TextArea', {
        innerHTML: card_dpath + '.description',
        _class: 'edit-card-description-textarea',
        connect_onclick: function(e){
            e.stopPropagation();
        }
    });

    var edit_control_div = card_edit_div._(
        'div', {_class: 'edit-card-description-control'});
    edit_control_div._('div', {
        innerHTML: 'Save',
        _class: 'save-card-description'
    });
    edit_control_div._('div', {
        _class: 'fa fa-times'
    });

}


function edit_list_name(that, event){
   /* Edit list name and save it on enter */

    var domnode = that.domNode;
    var pre_edit_value = domnode.innerText;
    var list_id = that.getAttr('list_id');
    var board_id = that.getRelativeData('board_id');

    event.stopPropagation();

    domnode.innerText = "";
    that._('input', {
        value: pre_edit_value,
        pre_edit_value: pre_edit_value,
        list_id:list_id,
        board_id: board_id,
        _class: 'edit-list-name-input',
        connect_onkeyup: function(e){

            // keyCode 13 is enter
            if(e.keyCode == 13) {

                // server call to save
                var result = genro.serverCall(
                    'edit_list_name',
                    {list_id: this.getAttr('list_id'),
                     board_id: this.getAttr('board_id'),
                     value: this.domNode.value }
                );

                if (result == true){
                    genro.publish(
                        'floating_message',
                        {message: 'List name saved!'});

                    // In case of successful save the input is
                    // replaced from the text containing the new value.
                    domnode.innerText = this.domNode.value;
                } else {
                    genro.publish(
                        'floating_message',
                        {message: 'The list name is required!',
                         messageType:'error'});
                }

            } else if(e.keyCode == 27 ){
                domnode.innerText = this.getAttr('pre_edit_value');
            }
        }
    });
}


function create_list(node, board_id, list_id, cards){

    var list_wrapper = node._('div', {_class:'list-wrapper'});

    // name of the list
    var list_div = list_wrapper._('div', {_class: 'gen-list'});
    list_div._('h3', {
        innerHTML: '^.' + board_id + '.' + list_id + '?list_name',
        list_id: list_id,
        connect_ondblclick: "var that=this; edit_list_name(that, event);",
    });

    var list_cards = list_div._('div', {
        id: list_id,
        nodeId: list_id,
        _class: 'list-cards',
        dropTarget: true, dropTypes:'*',
        onDrop: function(dropInfo, data, _kwargs){
            var domNode = dropInfo.domnode;
            var card_pkey = data.card_pkey;
            var src_list_pkey = data.src_list_pkey;
            var dest_list_pkey = domNode.id;

            var board_id = this.getRelativeData('board_id');
            var board_store = this.getRelativeData('board.' + board_id);
            
            // Gets the card bag
            card_bag = board_store.getItem(src_list_pkey + '.' + card_pkey);

            // Remove the card from the previous list
            board_store.delItem(src_list_pkey + '.' + card_pkey);

            // Update the card bag with new infos
            var list_name = board_store.getAttr(
                dest_list_pkey, list_name)['list_name'];
            card_bag.setItem('list_id', dest_list_pkey);
            card_bag.setItem('list_name', list_name);

            // Add the card to the new list
            board_store.setItem(dest_list_pkey + '.' + card_pkey, card_bag);


            // Appends to the current domNode (list) the dragged card
            var card = document.getElementById(card_pkey);
            // update the label as it was generated through datapath
            var card_lbl = card.getElementsByClassName('list-card-label')[0];
            card_lbl.innerText = card_bag.getItem('name');
            domNode.appendChild(card);
        }
    });

    list_div._('div', {
        innerHTML: 'Add a card...',
        list_id: list_id,
        _class:'add-new-card',
        connect_onclick: "var that=this; create_new_card(that);"
    });

    for (var c in cards){
        create_card(list_cards, board_id, list_id, c);
    }

}


function add_new_list(that, event){
    /* Add a new list  */

    var domnode = that.domNode;
    var pre_edit_value = domnode.innerText;
    var board_id = that.getRelativeData('board_id');

    event.stopPropagation();

    domnode.innerText = "";
    that._('input', {
        pre_edit_value: pre_edit_value,
        placeholder: pre_edit_value,
        board_id: board_id,
        _class: 'add-new-list-input',
        connect_onkeyup: function(e){

            // keyCode 13 is enter
            if(e.keyCode == 13) {
                var board_id = this.getAttr('board_id');

                // server call to save
                var result = genro.serverCall(
                    'add_new_list',
                    {board_id: board_id,
                     value: this.domNode.value}
                );

                if (result == false){
                    genro.publish(
                        'floating_message',
                        {message: 'The list name is required!',
                         messageType:'error'});

                } else {
                    var list_id = result.getItem('id')
                    var board_bag = that.getRelativeData('board.'+ board_id);

                    board_bag.setItem(list_id, new gnr.GnrBag(),
                                      {'list_name': result.getItem('name')});

                    var board_node = that.nodeById('board_page');

                    // this call create a list without cards
                    create_list(board_node, board_id, list_id, []);

                    // this call remove the new list dive and
                    // recreate it to the end of board
                    create_add_new_list_div(board_node);

                    genro.publish(
                        'floating_message',
                        {message: 'List saved!'});
                }

            } else if(e.keyCode == 27 ){
                domnode.innerText = this.getAttr('pre_edit_value');
            }
        }
    });

}

function create_add_new_list_div(node) {
    /* Creates the div/btn to create a new list

       In case there is already a div/btn remove it and the create
       it in the end of page.

     */
    // check if there is already this div there is remove it and create a new one
    var new_list_div = document.getElementById('new_list_div')

    if (new_list_div != null) {
        new_list_div.remove();
    }

    var add_newlist_wrapper = node._('div', {
        _class: 'list-wrapper', id: 'new_list_div',
    });

    var new_list_div = add_newlist_wrapper._('div', {_class: 'add-new-list'});
    new_list_div._('h3', {
        innerHTML: 'Add new list',
        connect_ondblclick: "var that=this; add_new_list(that, event);",
    });

}


function create_new_board(that){
    /* Create a new board */

    that.freeze();

    var dlg = genro.dlg.quickDialog('Add Board');
    var center = dlg.center;
    var box = center._('div', {datapath:'new_board', padding:'20px'});
    var fb = genro.dev.formbuilder(box, 1, {border_spacing:'6px'});

    fb.addField('textBox', {
        value:'^.name' ,
        lbl: 'Title',
        validate_notnull: true,
        validate_notnull_error: _T('Mandatory field')
    });

    fb.addField('textArea', {
        value: '^.description', lbl: 'Description'
    });

    fb.addField('dbselect', {
        value: '^.team_id', lbl: 'Team',
        dbtable:'base.team', hasDownArrow: true,
        validate_notnull: true,
        validate_notnull_error: _T('Mandatory field')
    });

    var bottom = dlg.bottom._('div');
    var saveattr = {
        'float': 'right', label: _T('Create'),
        dlg: dlg,
        action: function() {
            var dlg = this.getAttr('dlg');

            var team_id = this.getRelativeData('new_board.team_id');

            var team_boards_nums = this.getRelativeData('teams.' + team_id);
            team_boards_nums = team_boards_nums?team_boards_nums.len():0;

            var result = genro.serverCall('add_board', {
                name: this.getRelativeData('new_board.name'),
                description: this.getRelativeData('new_board.description'),
                position: team_boards_nums++,
                team_id: team_id
            });
            if (result) {
                genro.publish(
                    'floating_message',
                    {message: 'Board created!'});

                create_board_div(this, result);

                dlg.close_action();
            }

        }};

    bottom._('button', saveattr);
    bottom._('button', {
        'float':'right', label:_T('Cancel'),
        action:dlg.close_action
    });

    dlg.show_action();

    that.unfreeze()
}

function create_board_div(that, values) {
    var team_id = values.getItem('team_id');

    var create_new_board = document.getElementById(
        'create_new_board_' + team_id);
    if (create_new_board){
        create_new_board.remove()
    }

    var board_id = values.getItem('id');
    var node = genro.nodeById(team_id);
    that.setRelativeData('teams.' + team_id + '.' + board_id, values);

    node._('div', {
        board_id: board_id, _class: 'board-list-item',
        connect_onclick: "generate_board_page(this)",
    })._('div', {value:'^.' + team_id + '.' + board_id + '.name',
                 innerHTML: values.getItem('name'),
                 _class: 'board-tile'});

    create_new_board_btn(node, team_id);

}


function create_new_board_btn (node, team_id) {

    node._('div', {
        id: 'create_new_board_' + team_id,
        _class: 'board-list-item',
        connect_onclick:"create_new_board(this);"
    })._('div', {
        innerHTML: _T('+ Create new board...'),
        _class: 'board-tile create-new-board'
    });
}


function create_new_team(that){

    that.freeze();

    var create_new_team = document.getElementById('create_new_team');
    if (create_new_team){
        create_new_team.remove()
    }


    var dlg = genro.dlg.quickDialog('Add Team');
    var center = dlg.center;
    var box = center._('div', {datapath:'new_team', padding:'20px'});
    var fb = genro.dev.formbuilder(box, 1, {border_spacing:'6px'});

    fb.addField('textBox', {
        value:'^.name' ,
        lbl: 'Title',
        validate_notnull: true,
        validate_notnull_error: _T('Mandatory field')
    });

    fb.addField('textArea', {
        value: '^.description', lbl: 'Description'
    });

    var bottom = dlg.bottom._('div');
    var saveattr = {
        'float': 'right', label: _T('Create'),
        dlg: dlg,
        action: function() {
            var dlg = this.getAttr('dlg');

            var result = genro.serverCall('add_team', {
                name: this.getRelativeData('new_team.name'),
                description: this.getRelativeData(
                    'new_team.description'
                )
            });

            if (result) {
                genro.publish(
                    'floating_message',
                    {message: 'Team created!'});

                create_team_div(this, result);

                dlg.close_action();
            }

        }};

    bottom._('button', saveattr);
    bottom._('button', {
        'float':'right', label:_T('Cancel'),
        action:dlg.close_action
    });

    dlg.show_action();

    that.unfreeze()

}


function create_team_div(that, values) {

    var team_id = values.getItem('id');

    var create_new_team = document.getElementById('create_new_team');
    if (create_new_team){
        create_new_team.remove()
    }

    var node = genro.nodeById('team_page');

    var team_name = values.getItem('name');
    that.setRelativeData(
        'teams.', team_id,
        {team_name: team_name}
    );

    var team_div = node._('div', {_class: 'team-div'});
    var team_title = team_div._('div', {
        innerHTML: team_name,
        _class: 'team-title'
    });
    var board = team_div._('div', {_class: 'team-boards-div'})._(
        'div', {_class: 'board-list', nodeId: team_id, id: team_id});

    create_new_board_btn(board, team_id);
    create_new_team_btn(node);

}


function create_new_team_btn (node) {

    node._('div', {_class: 'team-div'})._('div', {
        id: 'create_new_team',
        _class: 'add-new-team-btn',
        connect_onclick:"create_new_team(this);"
    })._('div', {
        innerHTML: _T('Add new team...'),
    });
}
