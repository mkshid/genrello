#!/usr/bin/env
# -*- coding: utf-8 -*-

from gnr.core.gnrbag import Bag
from gnr.core.gnrdecorator import public_method


class GnrCustomWebPage(object):

    css_requires = 'css/base'
    js_requires = 'js/main_page'

    def main(self, root, **kwargs):
        frame = root.framePane()
        sc = frame.center.stackContainer(selected='^page_selected')

        self.team_page(sc.contentPane(title='!!Teams', datapath='teams'))
        self.board_page(sc.contentPane(title='!!Board', datapath='board'))

        frame.top.slotToolbar('*,stackButtons,*', _class='page_slotbar')
        sc.data('^page_selected', 0)

    def team_page(self, pane):
        pane.attributes.update({'background_color': 'white'})
        qs =  self.get_teams_boards()
        pane.data('^teams', qs)

        for r in qs:
            team_id = r.getLabel()
            values = r.getValue()
            team_div = pane.div(
                '^.{0}?team_name'.format(team_id),
                _class='team-title'
            ).ul(_class='board-list', nodeId=team_id, id=team_id)

            for v in values:
                board_id = v.getValue().getItem('pkey')
                # Set the board_id as attribute so i can use to his list etc..
                team_div.li(
                    board_id=board_id ,
                    _class='board-list-item',
                    connect_onclick="""
                       // call a function to generate the board page
                       generate_board_page(this);
                    """,
                ).div(
                    '^.{0}.{1}.name'.format(team_id, board_id),
                    _class='board-tile'
                )

        # Button to create a new board
        team_div.li(
            id='create_new_board',
            _class='board-list-item',
            connect_onclick="create_new_board(this);"
        ).div(
            '!!+ Create new board...',
            _class='board-tile create-new-board'
        )

    def board_page(self, pane):
        # Entry point of the board page.
        pane.div(
            id='board_page', nodeId='board_page',
            _class='board-page'
        )
    @public_method
    def get_teams_boards(self):
        """Gets a bag with team and boards"""

        tbl = self.db.table('base.board')
        qs = tbl.query(
            '$name,$team_id,$team_name,$position',
            where='$owner_user_id=:user_id',
            user_id=self.dbCurrentEnv()['user_id'],
            order_by='$position'
        ).fetch()

        result = Bag()
        for r in qs:
            result.setAttr(r['team_id'], team_name=r['team_name'])
            result.setItem('{0}.{1}'.format(r['team_id'], r['pkey']), Bag(r))
        return result

    @public_method
    def get_lists_cards(self, board_id):
        """Gets a bag with lists and cards"""

        tbl = self.db.table('base.list')
        lists_qs = tbl.query(
            where='$board_id=:board_id',
            board_id=board_id,
            order_by='$position'
        ).fetch()

        tbl = self.db.table('base.card')
        cards_qs = tbl.query(
            '$name,$description,$position,$list_name,$list_id',
            where='$list_board_id=:board_id',
            board_id=board_id,
            order_by='$position'
        ).fetch()

        result = Bag()
        for lst in lists_qs:
            result.setItem(lst['id'], Bag(), list_name=lst['name'])

        for crd in cards_qs:
            result.setItem('{0}.{1}'.format(crd['list_id'], crd['pkey']), Bag(crd))

        return result


    @public_method
    def save_card(self, list_id, card_name):
        """Save the card """

        tbl = self.db.table('base.card')
        card = {
            'name': card_name,
            'list_id': list_id
        }
        tbl.insert(card)
        tbl.db.commit()
        return Bag(card)


    @public_method
    def edit_list_name(self, list_id, board_id, value):
        """Save name of a list after the field has been edited"""

        value = value.strip()
        if not value:
            return False

        tbl = self.db.table('base.list')
        tbl.update({'id': list_id, 'name': value,
                    'board_id': board_id})
        tbl.db.commit()
        return True

    @public_method
    def add_new_list(self, board_id, value):
        """Add new list"""

        value = value.strip()
        if not value:
            return False

        tbl = self.db.table('base.list')
        new_list = {'name': value,
                    'board_id': board_id}
        tbl.insert(new_list)
        tbl.db.commit()
        return Bag(new_list)


    @public_method
    def add_board(self, name, description, team_id):
        values = {
            'name': name,
            'description': description,
            'team_id': team_id,
            'owner_user_id': self.dbCurrentEnv()['user_id']
        }
        tbl = self.db.table('base.board')
        tbl.insert(values)
        tbl.db.commit()

        return Bag(values)
