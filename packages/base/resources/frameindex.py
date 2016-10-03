from gnr.web.gnrwebpage import BaseComponent
from gnr.core.gnrbag import Bag


class GenrelloFrameIndex(BaseComponent):
    """GenrelloFrameIndex

    overrides the adm/framindex.py

    """
    hideLeftPlugins = True


    def prepareTop(self,pane,onCreatingTablist=None):
        pane.attributes.update(dict(
            height='30px', overflow='hidden',
            _class='framedindex_tablist', drawer='close'
        ))

        bc = pane.borderContainer(margin_top='4px') 
        leftbar = bc.contentPane(
            region='left', overflow='hidden'
        ).div(display='inline-block', margin_left='10px')  

        for btn in ['menuToggle'] + self.plugin_list.split(','):
            getattr(self,'btn_%s' %btn)(leftbar)
            
        if self.custom_plugin_list:
            for btn in self.custom_plugin_list.split(','):
                getattr(self,'btn_%s' %btn)(leftbar)
        
        self.prepareTablist(
            bc.contentPane(region='center'),
            onCreatingTablist=onCreatingTablist
        )
