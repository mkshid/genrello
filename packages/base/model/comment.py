#!/usr/bin/env python
# encoding: utf-8


class Table(object):

    def config_db(self, pkg):
        tbl = pkg.table('comment', pkey='id', name_long='!!Comment',
                        name_plural='!!Comments', caption_field='comment')
        self.sysFields(tbl)

        tbl.column('comment', name_short='comment',
                   validate_notnull=True, validate_case='c',
                   validate_notnull_error='!!Mandatory field')

        tbl.column(
            'card_id', size='22', group='_',
            name_long='!!card id'
            ).relation(
                'card.id', relation_name='comment_card',
                mode='foreignkey', onDelete='cascade'
            )

        tbl.column(
            'owner_user_id', size='22', group='_',
            name_long='!!Owner'
            ).relation(
                'adm.user.id', relation_name='comment_user',
                mode='foreignkey', onDelete='cascade'
            )
        tbl.aliasColumn('username', relation_path='@user_id.username',
                        name_long='!!Username')
