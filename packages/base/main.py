#!/usr/bin/env python
# encoding: utf-8
from gnr.app.gnrdbo import GnrDboTable, GnrDboPackage

class Package(GnrDboPackage):
    def config_attributes(self):
        return dict(comment='base package',sqlschema='base',sqlprefix=True,
                    name_short='Base', name_long='Base', name_full='Base')
                    
    def config_db(self, pkg):
        pass
        
class Table(GnrDboTable):
    pass
