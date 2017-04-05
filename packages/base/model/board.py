#!/usr/bin/env python
# encoding: utf-8


class Table(object):

    def config_db(self, pkg):
        tbl = pkg.table('board', pkey='id', name_long='!!Board',
                        name_plural='!!Boards', caption_field='name')
        self.sysFields(tbl)

        tbl.column('name', name_short='Name',
                   validate_notnull=True, validate_case='c',
                   validate_notnull_error='!!Mandatory field')

        tbl.column('description', name_long='!!Description')
        tbl.column('method', name_long='!!Method')
        tbl.column('position', dtype='I', name_long='!!Position')

        tbl.column(
            'team_id', size='22', group='_',
            name_long='!!Team id'
            ).relation(
                'team.id', relation_name='board_team',
                mode='foreignkey', onDelete='cascade'
            )

        tbl.column(
            'owner_user_id', size='22', group='_',
            name_long='!!Owner'
            ).relation(
                'adm.user.id', relation_name='board_user',
                mode='foreignkey', onDelete='cascade'
            )
        tbl.aliasColumn('username', relation_path='@owner_user_id.username',
                        name_long='!!Username')

        tbl.aliasColumn('team_name',
                        relation_path='@team_id.name',
                        name_long='!!Team name')
