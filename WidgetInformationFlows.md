# Introduction #

This page summarizes the (possible) information / parameter value flows involved in generating a webbrick widget display from an initial page request.

The overall framework can get quite confusing, with a fair amount of redundancy, but this seems to be needed to support various usage and testing patterns.  I have found this summary helps me to keep things straight in my head when working with widgets.  The TurboGears widget framework is a bit idiosyncratic in some areas - I don't have a clear mental model of what values come from where, and the code patterns used are rather based on trial-and-error explorations.  I'm hoping that at some stage I can move to the new framework adopted by TG 2.0, which I hope will be a little more transparent in its workings.

# Details #

Page request URI path and parameters
> => cherrypy controller page rendering method (controller.py, etc.)
> > => dictionary passed to page template (templates/_page_.kid)
> > > => widget class constructor invoked by template (_widget_.py)
> > > > => widget template (Kid template language code contained in or referenced by the widget class), values passed in via TurboGears widget framework
> > > > > => widget initialization javascript code (_widget_.js)