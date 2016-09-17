#!/usr/bin/env python
# encoding: utf-8


class Table(object):

    def config_db(self, pkg):
        tbl = pkg.table('list', pkey='id', name_long='!!List',
                        name_plural='!!Lists', caption_field='name')
        self.sysFields(tbl)

        tbl.column('name', name_short='Name',
                   validate_notnull=True, validate_case='c',
                   validate_notnull_error='!!Mandatory field')
        tbl.column('position', dtype='I', name_long='!!Position')

        tbl.column(
            'board_id', size='22', group='_',
            name_long='!!board id'
            ).relation(
                'board.id', relation_name='list_board',
                mode='foreignkey', onDelete='cascade'
            )
