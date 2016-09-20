function generate_board_page(that, board_id){
    /* Generate the board page */

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
        var list_cards = list_div._('div', {_class: 'list-cards'});
        var cards = res_asDict[k];
        for (var c in cards){
            var card =list_cards._('div', {
                _class: 'list-card'
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
