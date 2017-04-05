#!/usr/bin/env python
# encoding: utf-8

from settings import METHODS_LISTS
from datetime import datetime


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


    def trigger_onInserted(self, record):
        """Trigger that create list according to board method"""

        method_lists = METHODS_LISTS.get(record.get('method', ''), None)

        if method_lists is None:
            return

        board_id = record['id']
        lst_tbl = self.db.table('base.list')
        lst_to_add = []
        now = datetime.now()

        for i, lst_name in enumerate(method_lists):
            lst_to_add.append({
                '__ins_ts': now, '__mod_ts': now, 'id': lst_tbl.newPkeyValue(),
                'name': lst_name, 'position': i, 'board_id': board_id
            })

        try:
            lst_tbl.insertMany(lst_to_add)
            lst_tbl.db.commit()
        except Exception as e:
            print e
