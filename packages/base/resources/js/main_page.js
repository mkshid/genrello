function clean_up_board_page(that){
    var bp_div = document.getElementById('board_page');

    // remove the child of the previous board
    while(bp_div.hasChildNodes()){
        var node = bp_div.firstChild;
        bp_div.removeChild(node);
    }
}

function generate_board_page(that, board_id){
    /* Generate the board page */

    // clean up the board page
    clean_up_board_page(that);

    // Gets the node of board page
    var bp_node = that.nodeById('board_page');

    // Make a serverCall to gets lists and cards related
    // to the board.
    var result = genro.serverCall(
        'get_lists_cards',
        {board_id: board_id}
    );
    // sets the return result to the board datapath
    that.setRelativeData('board', result);

    var res_asDict = result.asDict(true);

    for (var k in res_asDict){
        var list_wrapper = bp_node._('div', {_class:'list-wrapper'});
        // name of the list
        var list_div = list_wrapper._('div', {_class: 'gen-list'})
        list_div._('h3', {innerHTML: '^.' + k + '?list_name'});

         // create a ul for the cards
        var list_cards = list_div._('div', {
            id: k,
            _class: 'list-cards',
            dropTarget: true, dropTypes:'*',
            onDrop: function(dropInfo, data, _kwargs){
                var domNode = dropInfo.domnode;
                var card_pkey = data.card_pkey;
                var src_list_pkey = data.src_list_pkey;
                var dest_list_pkey = domNode.id;

                var board_store = this.getRelativeData('board');

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

        var cards = res_asDict[k];
        for (var c in cards){
            var card =list_cards._('div', {
                id: c,
                _class: 'list-card', draggable: true,
                onDrag: function(dragValues, dragInfo, treeItem){
                    var domNode = dragInfo.domnode;
                    dragValues['card_pkey'] = domNode.id;
                    dragValues['src_list_pkey'] = domNode.parentNode.id;
                }
            });
            card._('div', {
                innerHTML: '^.' + k + '.' + c + '.name',
                _class: 'list-card-label'
            });

        }
    }

    // Once done with the rendering change the page
    that.setRelativeData('page_selected', 1);
}
