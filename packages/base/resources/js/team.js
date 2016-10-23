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
