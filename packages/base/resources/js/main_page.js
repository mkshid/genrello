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
         var list_div = bp_node._('div');
         // name of the list
         list_div._('h3', {innerHTML: '^.' + k + '?list_name'});

         // create a ul for the cards
         var ul = list_div._('ul');
         var cards = res_asDict[k];
         for (var c in cards){
             ul._('li', {innerHTML: '^.' + k + '.' + c + '.name'});
        }
    }

    // Once done with the rendering change the page
    that.setRelativeData('page_selected', 1);
}
