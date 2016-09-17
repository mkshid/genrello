#!/usr/bin/env
# -*- coding: utf-8 -*-


class GnrCustomWebPage(object):

    def main(self, root, **kwargs):
        frame = root.framePane()
        sc = frame.center.stackContainer(selected='^page_selected')

        self.team_page(sc.contentPane(title='!!Teams', datapath='team'))
        self.board_page(sc.contentPane(title='!!Board', datapath='board'))


    def team_page(self, pane):
        pass

    def board_page(self, pane):
        pass
