from gnr.web.gnrwebpage import BaseComponent
from gnr.core.gnrbag import Bag


class GenrelloFrameIndex(BaseComponent):
    """GenrelloFrameIndex

    overrides the adm/framindex.py

    """
    hideLeftPlugins = True


    def prepareTop(self,pane,onCreatingTablist=None):
        pane.dataController(
            """
            var kw = {file: 'main_page',
                     fullpath: 'gnr.appmenu.root.mainmenu.mm_main_page',
                     label: 'Homepage',
                     url: '/main_page'};
            kw.openKw = {topic: 'main_page_load'};
            genro.mainGenroWindow.genro.publish('selectIframePage',kw);
            """,
            _onStart=True
        )

        if '_DEV_' in self.userTags or 'admin' in self.userTags:
            frameindex_attrs = dict(
                height='30px', overflow='hidden',
                _class='framedindex_tablist',
                drawer='close'
            )
        else:
            # Hide the bar in case of normal user
            frameindex_attrs['display'] = 'none'

        pane.attributes.update(frameindex_attrs)

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

    def prepareBottom(self, pane):
        pass
