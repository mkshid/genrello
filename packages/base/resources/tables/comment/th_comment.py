#!/usr/bin/python
# -*- coding: UTF-8 -*-

from gnr.web.gnrbaseclasses import BaseComponent
from gnr.core.gnrdecorator import public_method

class View(BaseComponent):

    def th_struct(self,struct):
        r = struct.view().rows()
        r.fieldcell('comment')
        r.fieldcell('card_id')
        r.fieldcell('owner_user_id')

    def th_order(self):
        return 'comment'

    def th_query(self):
        return dict(column='comment', op='contains', val='')



class Form(BaseComponent):

    def th_form(self, form):
        pane = form.record
        fb = pane.formbuilder(cols=2, border_spacing='4px')
        fb.field('comment')
        fb.field('card_id')
        fb.field('owner_user_id')


    def th_options(self):
        return dict(dialog_height='400px', dialog_width='600px')
