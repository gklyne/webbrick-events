# Introduction #

This page describes the model of events used by webbrick-events.  The term "event" is used here in the sense of an occurrence that happens at a particular point in time, often in response to something that happens in the real world, such as a a computer being switched on, a user entering input to an application, or a sensor being activated.

The event model was designed primarily to support real-time control and monitoring functions for web-based home control and building management applications, but is quite generic and designed to assume as possible about the applications that may use the framework.

**Soapbox**

> Separately from the work on web-based real-time control and monitoring, I was involved briefly in developments of web portal software, which led me to a deeply held distaste for the proposed Web Services for Remore Portlet (WSRP) protocols and many unnecessary complexities that they introduce.  One of the goals of WSRP is to allow one portlet to respond to changes made in another portlet, and the WSRP solution is to introduce a complete new layer of inter-process communication.  I believe that what is really required is a simple mechanism for delivering events to a browser, and that this webbrick-events framework could be a candidate for such a mechanism.  For more commentary, see [Inter-portlet communication considered harmful](http://wiki.oss-watch.ac.uk/InterPortletCommunicationConsideredHarmful).

> This webbrick-events framework represents some of the steps that I believe are required to support multiple concurrent web page display synchronization.

> _(Graham Klyne)_


# Event details #

An event has the following elements:

```
  +---------------+---------------+---------------+
  | event type    | event subject | payload ...   |
  +---------------+---------------+---------------+
```

  * an **event type** is a URI that identifies the type of event; e.g. the occurrence that is being signalled by the event.  This might be a user pressing a button, or a temperature sensor threshold crossing.
    * the event framework predefines just one event type:  that used to notify that an event handler has subscribed to an event.
    * any other event types are for the calling application to define and interpret.
  * an **event subject** (sometimes referred to as an **event source**, though this turns out to be a misnomer) is a URI that identifies the subject of an event.  For example, if the event type indicates the user pressing a button, the event subject would identify the system component that is intended to be activated by the button press;  or if the event indicates a temperature threshold crossing, the event subject might identify a particular temperature sensor.  The combination of **event type** and **event subject** should be chosen by the application designer to provide just sufficient information for effective event subscriptions and routing.
  * the **payload** is any additional data about the event that may be used by the subscriber to an event.  The payload is treated as completely opaque by the event distribution system (except in the case of subscription events).  The intent is that the format of the payload is determined by the event type; only those application components that know about the event type should have any need to examine the payload.

Note that an event does not, of itself, contain a target address, or carry any indication of what system component it is directed towards.  Further, it does not necessarily indicate where it is coming from (though in some cases this may be indicated by the event subject).


# Event subscription #

An event subscriber indicates those events that it wishes to be notified about by indicating an event type and/or subject, either of which may be unspecified (wildcard).  The payload is never taken into account for event subscriptions (though applications may choose to filter events notified on the basis of payload content).

Event subscriptions carry a timeout.  The intent is that subscriptions must be periodically renewed, or will eventually lapse if a system component becomes disconnected from the network.  _[[[Currently, the subscription timeout feature is not implemented, and the timeout value is ignored except that a timeout of zero is used to indicate a request to terminate a subscription]]]_

An event subscription is propagated across the event distribution network as a subscription event.  See "Event routing" (below) for more details.

There is some special treatment of subscriptions to that specify neither event type nor event subject (i.e. subscriptions to _all_ events).  _[[[TBD](Details.md)]]_


## Watching for subscriptions ##

An event publisher may also be a **watcher**, which requests notification of new subscriptions.  This is done by subscribing to event subscription events for a given event type.  This is intended to support situations that some events are expensive to generate or propagate, and should be generated only when some other part of the system is actually listening for them.

Watcher subscriptions get special handling in that they are handled completely locally to the requesting event node, and are never sent across the network.  Thus, a watcher receives notifications of only those subscription events that are received at a node from which they may be published


# Event propagation and routing #

Events may be propagated across a number of **event routers**.

A simple deployment of this event distribution framework may use a single event router in a single process, to which all event publishers and subscribers connect directly.

But event driven applications get much more interesting when they are distributed across a local or global network.  This is supported by having multiple routers that can propagate events and event subscriptions between themselves as required.

Currently, events are propagated between routers using a protocol based on HTTP, using long-lived HTTP connections following an approach similar to that used by [cometd](http://cometdproject.dojotoolkit.org/)/[bayeux](http://svn.cometd.com/trunk/bayeux/bayeux.html) or [BOSH](http://xmpp.org/extensions/xep-0124.html).  Indeed, either of these might be candidate carrier protocols for this framework, and BOSH is one that I would like to use if I can locate sufficiently easy-to-use libraries for these.

The propagation of events between event routers uses a simple notion of **event routing**.  When a subscription is issued, statically defined routing tables (similar in spirit to IP packet routing tables) are used to forward the subscription towards appropriate event publishers.  As these subscriptions are processed, event routing entries in the reverse direction are dynamically created to forward events from the publisher to the subscriber.  Like event subscription, event routing is based on just an event type and an event subject;  the event payload is never considered by the event routing mechanisms (except that, in the case of a subscription event, the subscribed event type and subject are carried in the subscription event payload).

_[[[Note special handling of fully-wildcard subscriptions - details TBD](.md)]]_


# URIs and URI references #

Event types and event subjects are defined to be URIs [RFC 3986](http://www.ietf.org/rfc/rfc3986.txt).  The implementation itself does not currently enforce use of any particular URI scheme or syntax, nor even basic conformance to RFC 3986 URI syntax.

Events that are published and subscribed over the open Internet SHOULD (per [RFC 2119](http://www.ietf.org/rfc/rfc2119)) use absolute URIs and avoid the use of relative URI references.  However, for events that are produced and consumed within a local environment, it may be appropriate to use relative URI references, with the expectation that these may be expanded to absolute form by gateway systems if they are sent outside that local environment.


# Security considerations #

The current event distribution implementation is completely open.  However, the implementation has been designed with a notion of **event agents** that can be used to support hop-by-hop authentication and authorization.  Alternatively, hop-by-hop security might be achieved by implementing event propagation over a secured connection (e.g. HTTPS, SSL, SSH, etc.)

The implementation design currently has no provision for end-to-end security.  Applications are free to add authentication information in event payloads.  To add such authentication details to event subscriptions for end-to-end security will require the subscription event format to be extended.