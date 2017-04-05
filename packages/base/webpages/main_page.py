#!/usr/bin/env python
# -*- coding: utf-8 -*-

from gnr.core.gnrbag import Bag
from gnr.core.gnrdecorator import public_method

from settings import BOARD_METHODS


class GnrCustomWebPage(object):

    css_requires = 'css/base'
    js_requires = 'js/team,js/board,js/list,js/card'

    auth_main = 'admin,user'

    def main(self, root, **kwargs):
        frame = root.framePane()
        sc = frame.center.stackContainer(selected='^page_selected')

        self.team_page(sc.contentPane(title='!!Teams', datapath='teams'))
        self.board_page(sc.contentPane(datapath='board'))

        top = frame.top.slotToolbar('8,home,*,logout', _class='page-slotbar')
        top.home.i(
            _class='fa fa-home home-icon',
            connect_onclick="this.setRelativeData('page_selected', 0);"
        )
        top.logout.div(
        connect_onclick="genro.mainGenroWindow.genro.logout()",
        _class='iconbox icnBaseUserLogout',
        tip='!!Logout'
        )
        sc.data('^page_selected', 0)
        sc.data('new_board.methods', BOARD_METHODS)

    def team_page(self, pane):
        pane.attributes.update({'background_color': 'white',
                                'nodeId': 'team_page',
                                'id': 'team_page'})

        qs =  self.get_teams_boards()
        pane.data('^teams', qs)

        for r in qs:
            team_id = r.getLabel()
            values = r.getValue()

            team_div = pane.div(_class='team-div')
            team_div.div(
                '^.{0}?team_name'.format(team_id),
                _class='team-title'
            )

            board_div = team_div.div(_class='team-boards-div'
            ).div(_class='board-list', nodeId=team_id, id=team_id)

            if values:
                for v in values:
                    board_id = v.getValue().getItem('pkey')
                    # Set the board_id as attribute so i can use to his list etc..
                    board_div.div(
                        board_id=board_id ,
                        board_name=v.getValue().getItem('name'),
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
            board_div.div(
                id='create_new_board_' + team_id,
                _class='board-list-item',
                connect_onclick="create_new_board(this);"
            ).div(
                '!!+ Create new board...',
                _class='board-tile create-new-board'
            )

        pane.div(_class='team-div').div(
            id='create_new_team', _class='add-new-team-btn',
            connect_onclick="create_new_team(this);"
        ).div('!!Add new team')

    def board_page(self, pane):
        # Entry point of the board page.
        pane.attributes.update({'background_color': 'rgb(0, 121, 191)'})

        pane.div(
            id='board_header', nodeId='board_header',
            _class='board-header'
        )

        pane.div(
            id='board_page', nodeId='board_page',
            _class='board-page'
        )
    @public_method
    def get_teams_boards(self):
        """Gets a bag with team and boards"""

        user_id = self.dbCurrentEnv()['user_id']

        tbl = self.db.table('base.team')
        teams_qs = tbl.query(
            where='$owner_user_id=:user_id',
            user_id=user_id,
            order_by='$__ins_ts'
        ).fetch()

        tbl = self.db.table('base.board')
        boards_qs = tbl.query(
            '$name,$team_id',
            where='$owner_user_id=:user_id',
            user_id=user_id,
            order_by='$position'
        ).fetch()

        result = Bag()
        for t in teams_qs:
            result.setAttr(t['id'], team_name=t['name'])

        for b in boards_qs:
            result.setItem('{0}.{1}'.format(b['team_id'], b['pkey']), Bag(b))

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
    def get_card_comments(self, card_id):
        tbl = self.db.table('base.comment')
        comments_qs = tbl.query(
            '$comment,$__ins_ts,$__mod_ts,$username',
            where='card_id=:card_id',
            card_id=card_id,
            order_by='$__ins_ts DESC'
        ).fetch()
        result = Bag()
        for cm in comments_qs:
            result.setItem(cm['pkey'], Bag(cm))

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
    def save_comment(self, card_id, value):
        user_id = self.dbCurrentEnv()['user_id']
        username = self.dbCurrentEnv()['user']

        tbl = self.db.table('base.comment')
        comment = {
            'comment': value,
            'card_id': card_id,
            'owner_user_id': user_id
        }
        try:
            tbl.insert(comment)
            tbl.db.commit()
            comment['username'] = username
            return Bag(comment)
        except Exception as e:
            raise e


    @public_method
    def update_card_description(self, card_id, description):
        """Add/Update the description of a card"""

        tbl = self.db.table('base.card')
        tbl.update({
            'id': card_id,
            'description': description
        })
        tbl.db.commit()
        return True

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
    def delete_list(self, list_id):
        """Delete list"""

        tbl = self.db.table('base.list')
        try:
            tbl.delete({'id': list_id})
            tbl.db.commit()
            return True
        except Exception as e:
            print e
            return False

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
    def add_board(self, name, description, b_method, position, team_id):
        """Add a new board"""

        values = {
            'name': name,
            'description': description,
            'method': b_method,
            'position': position,
            'team_id': team_id,
            'owner_user_id': self.dbCurrentEnv()['user_id']
        }
        tbl = self.db.table('base.board')
        tbl.insert(values)
        tbl.db.commit()

        return Bag(values)

    @public_method
    def add_team(self, name, description):
        values = {
            'name': name,
            'description': description,
            'owner_user_id': self.dbCurrentEnv()['user_id']
        }
        tbl = self.db.table('base.team')
        tbl.insert(values)
        tbl.db.commit()

        return Bag(values)
