#!/usr/bin/env python
# encoding: utf-8


class Table(object):

    def trigger_onInserted(self, record, **kwargs):
        user_id = record['id']

        tbl_tag = self.db.table('adm.htag')

        try:
            tag_id = tbl_tag.query(
                where="$code='user'").fetch()[0]['id']
        except Exception as e:
            raise e

        tbl_usertag = self.db.table('adm.user_tag')
        tbl_usertag.insert({'user_id': user_id, 'tag_id': tag_id})
        tbl_usertag.db.commit()

        tbl_team = self.db.table('base.team')
        team_record = {
            'name': 'Personal Boards', 'description': 'Personal',
            'owner_user_id': user_id
        }
        tbl_team.insert(team_record)
        tbl_team.db.commit()

        tbl_board = self.db.table('base.board')
        tbl_board.insert({
            'name': 'Personal', 'position': 1,
            'owner_user_id': user_id, 'team_id': team_record['id']
        })
        tbl_board.db.commit()
