# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Widget class for mode selector widget (e.g. occupied / vacant)
#

from urlparse import urljoin

from turbogears.widgets.base  import Widget, CompoundWidget, WidgetsList
from turbogears.widgets.forms import FormField, Button
from EventLib.URI             import EventBaseUri, EventSourceBase

# Default URIs for events (subject is used as event source)
ModeSelector_SetModeEvent    = urljoin(EventBaseUri,    "ModeSelector_SetMode")
ModeSelector_Subject         = urljoin(EventSourceBase, "ModeSelector_Subject")

class ModeSelector(FormField):
    template_with_simple_text = """
        <ModeSelectorWidget xmlns:py="http://purl.org/kid/ns#"
            py:attrs="attrs"
            InitializeWidget="ModeSelector_Init"
        >
          <ModeSelectorBody>
            <ModeSelectorButton py:for="m in ModeOptions" class="${ModeSelectorButton_class}">
              (${m['label']})
            </ModeSelectorButton>
          </ModeSelectorBody>
        </ModeSelectorWidget>
        """
    template_with_radio_buttons = """
        <ModeSelectorWidget xmlns:py="http://purl.org/kid/ns#"
            py:attrs="attrs"
            InitializeWidget="ModeSelector_Init"
        >
          <ModeSelectorBody>
            <ModeSelectorButton py:for="m in ModeOptions" class="${ModeSelectorButton_class}">
              <input type="radio" name="${m['name']}" value="${m['value']}">
                ${m['label']}
              </input>
            </ModeSelectorButton>
          </ModeSelectorBody>
          <!-- <p py:for="p in params" py:content="p" /> -->
        </ModeSelectorWidget>
        """
    template = template_with_radio_buttons

    params = ["attrs"]
    params_doc = {'attrs' : 'Dictionary containing extra (X)HTML attributes for '
                            'the mode selector outer element'}
    attrs = {}

    def update_params(self, d):
        """
        Called to allow a calling program to adjust values passed to the widget template.

        The incoming dictionary of values is derived mainly from keywork parameters to
        the .display method call to the widget class, supplied by the surrounding page
        template, and may also be provided by the CherryPy controller logic (e.g. from 
        URI query parameters).
        """
        super(ModeSelector, self).update_params(d)
        # Set widget name and id:
        # NOTE: 'name' and 'value' are treated specially and cannot be supplied from
        #       directly as arguments of the "display" function.
        if d.has_key('subjectname'):
            d['name'] = d['subjectname']
        elif d.has_key('id'):
            d['name'] = d['id']
        d['attrs']['name'] = d['name']
        d['attrs']['id']   = d['name']
        if d.has_key('id'):
            d['attrs']['id']   = d['id']
        # Set attribute values available to the browser widget code:
        d['attrs']['SetModeEvent'] = d.get('SetModeEvent', ModeSelector_SetModeEvent)
        d['attrs']['ModeSubject']  = d.get('ModeSubject',  ModeSelector_Subject)
        # The display function most provide a list of mode labels as ModeList
        # e.g. ModeList=['unknown', 'occupied', 'vacant']
        modelist = d['ModeList']
        defmode  = d.get('DefaultMode',  0)
        if defmode not in range(len(modelist)):
            defmode = 0
            print defmode, "::", range(len(modelist))
        d['attrs']['DefaultMode']  = str(defmode)
        d['attrs']['DefaultLabel'] = modelist[defmode]
        mo = []
        for i in range(1, len(modelist)):
            mo.append( {'name': d['name'], 'value': str(i), 'label': modelist[i]} )
        d['ModeOptions'] = mo
        # Set other values available directly to the template (above):
        d['ModeSelectorButton_class'] = "modeselector-unknown"
        # Debug:
        paramstext = [str(i) for i in d.items()]
        d['params'] = paramstext

# Example of dictionary structure passed to update_params:
#
# { 'convert': True, 
#   'error': None,
#   'field_id': u'uriname',
#   'field_class': 'ModeSelector',
#   'label': u'Uriname',
#   'value': None,
#   'css_classes': [], 
#   'help_text': None,
# 
#   'id': 'myzone',                                 (From page template)
#   'name': u'uriname',                             (From controller)
#    :
#   'attrs': { 'name': u'uriname', 
#              'id': 'myzone',
#              'SetModeEvent': 'myuri:SetModeEvent',
#              'ModeSubject': 'myuri:mymode',
#              'DefaultMode': 'unknown'}
#   }

# End.
