#!/usr/bin/env
# -*- coding: utf-8 -*-

from gnr.core.gnrbag import Bag
from gnr.core.gnrdecorator import public_method


class GnrCustomWebPage(object):

    css_requires = 'css/base'

    def main(self, root, **kwargs):
        frame = root.framePane()
        sc = frame.center.stackContainer(selected='^page_selected')

        self.team_page(sc.contentPane(title='!!Teams', datapath='team'))
        self.board_page(sc.contentPane(title='!!Board', datapath='board'))

        frame.top.slotToolbar('*,stackButtons,*', _class='page_slotbar')
        sc.data('^page_selected', 0)

    def team_page(self, pane):
        qs =  self.get_teams_boards()
        pane.data('^team', qs)

        for r in qs:
            team_id = r.getLabel()
            values = r.getValue()
            team_div = pane.div(
                '^.{0}?team_name'.format(team_id),
                _class='team-title'
            ).ul(_class='board-list')

            for v in values:
                team_div.li(
                    '^.{0}.{1}.name'.format(
                        team_id,
                        v.getValue().getItem('pkey')),
                    connect_onclick='debugger;',
                    _class='board-tile'
                )

    def board_page(self, pane):
        pass


    @public_method
    def get_teams_boards(self):
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
