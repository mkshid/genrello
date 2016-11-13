#!/usr/bin/env python
# -*- coding: utf-8 -*-


class GnrCustomWebPage(object):

    auth_main = 'admin'

    def main(self, root, **kwargs):
        root.button(
            'Open App preferences',
            action="""
            genro.mainGenroWindow.genro.publish('app_preference');
            """
        )
        root.button(
            'Open user preferences',
            action="""
            genro.mainGenroWindow.genro.publish('user_preference');
            """
        )

