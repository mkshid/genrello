function generate_board_page(that){
    /* Main function that generate the board page */


    var board_id = that.getAttr('board_id')
    // Set opened board_id in the store
    that.setRelativeData('board_id', board_id);

    // Gets the node of board page
    var bh_node = that.nodeById('board_header');
    bh_node.clearValue().freeze();
    bh_node._('div', {innerHTML:that.getAttr('board_name'),
                      _class: 'board-name'})

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
    bh_node.unfreeze();

    // Once done with the rendering change the page
    that.setRelativeData('page_selected', 1);
}

function create_new_board(that){
    /* Create a new board */

    that.freeze();

    var dlg = genro.dlg.quickDialog('Add Board');
    var center = dlg.center;
    var box = center._('div', {datapath:'new_board', padding:'20px'});
    var fb = genro.dev.formbuilder(box, 1, {border_spacing:'6px'});

    that.setRelativeData('new_board.team_id', that.getAttr('team_id'));

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
        dbtable:'base.team',
        condition: '$owner_user_id = :curr_user',
        condition_curr_user: '^server.dbEnv.user_id',
        hasDownArrow: true,
        validate_notnull: true,
        validate_notnull_error: _T('Mandatory field')
    });

    fb.addField('filteringSelect', {
        value: '^.method', lbl: 'Method',
        default_value: 'none',
        values: '^.methods'
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
                b_method: this.getRelativeData('new_board.method'),
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
