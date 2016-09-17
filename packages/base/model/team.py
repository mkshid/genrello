#!/usr/bin/env python
# encoding: utf-8


class Table(object):

    def config_db(self, pkg):
        tbl = pkg.table('team', pkey='id', name_long='!!Team',
                        name_plural='!!Teams', caption_field='name')
        self.sysFields(tbl)

        tbl.column('name', name_short='Name',
                   validate_notnull=True, validate_case='c',
                   validate_notnull_error='!!Mandatory field')

        tbl.column('description', name_long='!!Description')

        tbl.column(
            'owner_user_id', size='22', group='_',
            name_long='!!Owner'
            ).relation(
                'adm.user.id', relation_name='team_user',
                mode='foreignkey', onDelete='cascade'
            )
        tbl.aliasColumn('username', relation_path='@owner_user_id.username',
                        name_long='!!Username')
