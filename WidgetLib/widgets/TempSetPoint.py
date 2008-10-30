# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Widget class for simple temperature display and set point
#

from urlparse import urljoin

from turbogears.widgets.base  import Widget, CompoundWidget, WidgetsList
from turbogears.widgets.forms import FormField, Button
from EventLib.URI             import EventBaseUri, EventSourceBase

TempSetPoint_SetCurrentEvent = urljoin(EventBaseUri, "TempSetPoint_SetCurrentEvent")
TempSetPoint_SetTargetEvent  = urljoin(EventBaseUri, "TempSetPoint_SetTargetEvent")
TempSetPoint_ShowTargetEvent = urljoin(EventBaseUri, "TempSetPoint_ShowTargetEvent")
TempSetPoint_Subject         = urljoin(EventSourceBase, "TempSetPoint_Subject")

class TempSetPoint(FormField):
    template = """
        <SetPointWidget xmlns:py="http://purl.org/kid/ns#"
            py:attrs="attrs"
            InitializeWidget="TempSetPoint_Init"
        >
          <SetPointBody>
            <SetPointDisplay class="${SetPointValue_class}">
              <SetPointValue>
                <span class="${SetPointValue_class}" py:content="'??.?'">??.?</span>
              </SetPointValue>
              <SetPointState>
                <span class="${SetPointState_class}" py:content="'current'">current</span>
              </SetPointState>
            </SetPointDisplay>
            <SetPointButtons>
              <SetPointUp>
                <button value="Up" name="Up" type="button">
                  <img alt="Increase set point" src="/widgets/bullet_arrow_up.png" />
                </button>
              </SetPointUp>
              <SetPointDown>
                <button value="Down" name="Down" type="button">
                  <img alt="Decrease set point" src="/widgets/bullet_arrow_down.png" />
                </button>
              </SetPointDown>
            </SetPointButtons>
          </SetPointBody>
        </SetPointWidget>
        """
    params = ["attrs"]
    params_doc = {'attrs' : 'Dictionary containing extra (X)HTML attributes for '
                            'the temperature set point outer element'}
    attrs = {}

    def update_params(self, d):
        super(TempSetPoint, self).update_params(d)
        # Set widget name and id:
        if self.is_named:
            d['attrs']['name'] = d['name']
            d['attrs']['id']   = d['field_id']
        if d.has_key('id'):
            d['attrs']['id']   = d['id']
        # Set attribute values available to the browser widget code:
        d['attrs']['SetCurrentEvent'] = d.get('SetCurrentEvent', TempSetPoint_SetCurrentEvent)
        d['attrs']['SetTargetEvent']  = d.get('SetTargetEvent',  TempSetPoint_SetTargetEvent)
        d['attrs']['ShowTargetEvent'] = d.get('ShowTargetEvent', TempSetPoint_ShowTargetEvent)
        d['attrs']['Subject']         = d.get('Subject',         TempSetPoint_Subject)
        d['attrs']['DefaultTarget']   = d.get('DefaultTarget',   None)
        # Set other values available directly to the template (above):
        d['SetPointValue_class'] = "tempsetpoint-unknown"
        d['SetPointState_class'] = "tempsetpoint-unknown"
        # Debug:
        #paramstext = str(d)
        #d['params'] = paramstext

# Example of dictionary structure passed to update_params:
#
# { 'convert': True, 
#   'error': None,
#   'field_id': u'uriname',
#   'field_class': 'tempsetpoint',
#   'label': u'Uriname',
#   'value': None,
#   'css_classes': [], 
#   'help_text': None,
# 
#   'id': 'myzone',                                 (From page template)
#   'name': u'uriname',                             (From controller)
#   'Subject': 'myuri:myzone',                      (From page template)
#   'DefaultTarget': '15.0',                        (From page template)
#   'SetCurrentEvent': 'myuri:SetCurrentEvent',     (From page template)
#   'SetTargetEvent': 'myuri:SetTargetEvent',       (From page template)
#   'ShowTargetEvent': 'myuri:ShowTargetEvent',     (From page template)
# 
#   'SetPointValue_class': 'tempsetpoint-unknown',  (From widget code)
#   'SetPointState_class': 'tempsetpoint-unknown',  (From widget code)
# 
#   'attrs': { 'name': u'uriname', 
#              'SetCurrentEvent': 'myuri:SetCurrentEvent',
#              'DefaultTarget': '15.0',
#              'ShowTargetEvent': 'myuri:ShowTargetEvent',
#              'Subject': 'myuri:myzone',
#              'id': 'myzone',
#              'SetTargetEvent': 'myuri:SetTargetEvent'}
#   }

# End.
