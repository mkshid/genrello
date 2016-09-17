#!/usr/bin/env python
# encoding: utf-8


def config(root, application=None):

    models = root.branch(u'Models', tags="admin")
    models.thpage(u'Team', table='base.team')
    models.thpage(u'Board', table='base.board')
    models.thpage(u'List', table='base.list')
    models.thpage(u'Card', table='base.card')
    models.thpage(u'Comment', table='base.comment')

    developer = root.branch("!!Developer", tags='admin')
    developer.branch("Amministrazione", tags="admin", pkg="adm")
    developer.branch("Sistema", tags="admin", pkg="sys")
