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

}
