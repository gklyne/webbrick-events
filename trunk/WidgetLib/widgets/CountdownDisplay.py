# $Id$
#
# Copyright (c) 2008 O2M8 Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Widget class for countdown display.
# This is a numeric display, which, When set to a value > 0, changes state and 
# counts down by seconds until zero is reached, then resets to its original state.
# This widget is used to test an internal timer pulse generator.
#

from urlparse import urljoin

from turbogears.widgets.base  import Widget, CompoundWidget, WidgetsList
from turbogears.widgets.forms import FormField, Button
from EventLib.URI             import EventBaseUri

SetCountdownDisplayValueEvent = urljoin(EventBaseUri, "SetCountdownDisplayValue")

class CountdownDisplay(FormField):
    template = """
    <span xmlns:py="http://purl.org/kid/ns#"
        py:attrs="attrs"
        class="countdown_unknown"
        py:content="value"
        InitializeWidget="CountdownDisplay_Init"
    >
    </span>
    """
    params = ["attrs", "count"]
    params_doc = {'attrs' : 'Dictionary containing extra (X)HTML attributes for'
                            ' the countdown display tag'}
    attrs = {}

    def update_params(self, d):
        super(CountdownDisplay, self).update_params(d)
        if self.is_named:
            d['attrs']['name'] = d["name"]
            d['attrs']['id']   = d["field_id"]
        d['attrs']['SetCountdownDisplayValueEvent'] = SetCountdownDisplayValueEvent
        if d.get('count', None):
            d['value'] = d['count']

# End.
