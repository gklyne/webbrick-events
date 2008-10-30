$Id$

This directory is being used to assemble code for event-driven
control panels and widgets.  I'm using a directory layout here
that attempts to keep related python, Kid, HTML, CSS and Javascript 
modules closer together.

Tentatively, I am considering the following layout within this directory:

  pages - top-level web-page framing of panels, connecting them with specific control events and defining navigation paths between them.  This might be partially analogous to a Turbogears form template (cf. http://docs.turbogears.org/1.0/SimpleWidgetForm).  May also provide some element of layout of widgets on a page?

  widgets - control elements (widgets) that can be assembled on a panel, or may represent complete panel arrangements.  Individual widgets are in separate subdirectories, with shared code in the main widgets directory.

  spike - experimental code

  test - test code and data
    pages
    static
      css
      images
    TestServer - a TurboGears project for a server used in widget testing
    selenium   - a copy of selenium core that can be served by the test server

Each widget is a separate directory, and may contain Python, Kid, HTML, CSS and Javascript modules.  Widgets may be primitive or composite.  These work in essentially the same ways:   the main distinction is that primitive widgets are intended to be used (and reused) within a panel, where composite widgets are generally presented as a complete set of controls for some function. These may be used as-is in an installation, or as examples for creating new, customized panels.

Following Turbogears, widgets have the following attributes:
 * name -- Defines the name of the widget, for form fields this is used to define the field's name attribute.
 * template -- Defines the Kid template which is used to render the HTML for this widget. In a way this is very standard TurboGears stuff. The template can either be a string that is valid Kid Syntax or it can be a reference to a .kid template file. We'll look at overriding the template in a bit more depth in the next section, since this is a very common requirement for widget users.
 * default -- As seen above, this just defines the default value of the widget.
 * params -- Widgets params are where any special characteristics of the widget would be defined. Widgets also have some special functions to make sure that any given widget instance has all the params, not just from the widget itself, but also from all of its bases.
 * attrs -- You can pass a dictionary to this attribute to set arbitrary HTML attributes of the generated HTML element.
and the following main methods:
 * __init__(self, name=None, template=None, default=None, **params)
 * display (returns an elementtree node)
 * render (returns node serialized)
 * retrieve_javascript (returns list for top-level include)
 * retrieve_css (returns list for top-level include)

We will also want the generated widget to deal with dynamic events in its javascript, so we will want it to implement something like an MVC architecture in the browser.  Ideally, the exact logic will be generated from widget parameters, but that's a design choice not yet fully crystalized.

