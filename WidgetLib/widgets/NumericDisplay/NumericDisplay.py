# $Id$
#
# Copyright (c) 2008 WebBrick Systems Limited
# Released under the MIT licence
# See LICENCE.TXT included with these files,
# or http://www.opensource.org/licenses/mit-license.php
#
# Widget class for simple button on a form
#

from urlparse import urljoin

from turbogears.widgets.base  import Widget, CompoundWidget, WidgetsList
from turbogears.widgets.forms import FormField, Button
from EventLib.URI             import EventBaseUri

SetNumericDisplayValueEvent = urljoin(EventBaseUri, "SetNumericDisplayValue")
SetNumericDisplayStateEvent = urljoin(EventBaseUri, "SetNumericDisplayState")

class NumericDisplay(FormField):
    template = """
    <span xmlns:py="http://purl.org/kid/ns#"
        py:attrs="attrs"
        class="${field_class}"
        py:content="str(value)"
        InitializeWidget="NumericDisplay_Init"
    >
        (NumericDisplay)
    </span>
    """
    params = ["attrs", "value_override"]
    params_doc = {'attrs' : 'Dictionary containing extra (X)HTML attributes for'
                            ' the numeric display tag'}
    attrs = {}

    def update_params(self, d):
        super(NumericDisplay, self).update_params(d)
        if self.is_named:
            d['attrs']['name'] = d["name"]
            d['attrs']['id']   = d["field_id"]
        d['attrs']['SetNumericDisplayValueEvent'] = SetNumericDisplayValueEvent
        d['attrs']['SetNumericDisplayStateEvent'] = SetNumericDisplayStateEvent
        if d.get('value_override', None):
            d['value'] = d['value_override']

# End.
