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

    var list_wrapper = node._('div', {
        _class:'list-wrapper', id: list_id
    });

    // name of the list
    var list_div = list_wrapper._('div', {_class: 'gen-list'});
    var list_header = list_div._('div', {_class: 'list-header'});

    list_header._('p', {
        innerHTML: '^.' + board_id + '.' + list_id + '?list_name',
        list_id: list_id,
        connect_ondblclick: "var that=this; edit_list_name(that, event);",
    });

    list_header._('i', {
        _class: 'fa fa-trash-o',
        list_id: list_id,
        connect_onclick: "delete_list(this)"
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
        connect_onclick: "create_new_card(this, event);"
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
        _cloass: 'list-wrapper', id: 'new_list_div',
    });

    var new_list_div = add_newlist_wrapper._('div', {_class: 'add-new-list'});
    new_list_div._('h3', {
        innerHTML: 'Add new list',
        connect_ondblclick: "var that=this; add_new_list(that, event);",
    });

}


function delete_list(that){

    var dlg = genro.dlg.ask(
        _T('Delete List'),
        _T("Are you sure?"),{
            confirm:_T('Delete'), cancel:_T('Cancel')},
        {confirm:function(){delete_listCb();}})

    var delete_listCb = function(){
        var list_id = that.getAttr('list_id');

        var result = genro.serverCall(
            'delete_list',
            {list_id: list_id}
        );

        if (result == true){
            genro.publish(
                'floating_message',
                {message: 'List Removed!'}
            );
            document.getElementById(list_id).remove();
        }
    }
}
