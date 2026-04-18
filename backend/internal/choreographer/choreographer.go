// Package choreographer implements the event-driven coordination layer.
//
// Instead of the API gateway calling services imperatively, the choreographer
// subscribes to domain events published by each service and decides what
// cross-service reactions should occur. Services remain decoupled — they
// publish what happened; the choreographer decides what to do next.
//
// Architecture:
//
//	Service A completes work → publishes Event → Bus → Choreographer
//	                                                         ↓
//	                                               reacts: calls Service B / C
package choreographer

import (
	"context"
	"fmt"

	eventusecase "github.com/fsd-group/fsd/internal/usecase/event"
	"github.com/fsd-group/fsd/pkg/eventbus"
)


// Choreographer wires domain events to downstream service reactions.
type Choreographer struct {
	bus          *eventbus.Bus
	eventService *eventusecase.Service
}

// New creates a Choreographer and registers all event subscriptions on bus.
func New(bus *eventbus.Bus, eventService *eventusecase.Service) *Choreographer {
	c := &Choreographer{bus: bus, eventService: eventService}
	c.wire()
	return c
}

// Publish is a convenience wrapper so services can publish events without
// importing the eventbus package directly.
func (c *Choreographer) Publish(eventType string, payload any) {
	c.bus.Publish(eventbus.Event{Type: eventType, Payload: payload})
}

// wire registers all event-to-handler subscriptions.
func (c *Choreographer) wire() {
	c.bus.Subscribe(EventTypeCalendarSynced, c.onCalendarSynced)
	c.bus.Subscribe(EventTypeEventRequestAccepted, c.onEventRequestAccepted)
	c.bus.Subscribe(EventTypeEventRequestRejected, c.onEventRequestRejected)
	c.bus.Subscribe(EventTypeManualEventCreated, c.onManualEventCreated)
}

// onCalendarSynced reacts to a completed external calendar sync (UC10).
func (c *Choreographer) onCalendarSynced(e eventbus.Event) {
	p, ok := e.Payload.(CalendarSyncedPayload)
	if !ok {
		return
	}
	fmt.Printf("[choreographer] calendar.synced user=%s provider=%s events=%d",
		p.UserID, p.Provider, p.Count)
}

// onEventRequestAccepted reacts when a recipient accepts an event request (UC8).
// It confirms every placeholder event linked to the request (sender + all recipients).
func (c *Choreographer) onEventRequestAccepted(e eventbus.Event) {
	p, ok := e.Payload.(EventRequestResponsePayload)
	if !ok {
		return
	}
	ctx := context.Background()

	// Promote all placeholder events for this request from "pending" → "confirmed".
	if err := c.eventService.UpdateStatusByRequestID(ctx, p.RequestID, "confirmed"); err != nil {
		fmt.Printf("[choreographer] failed to confirm placeholder events request=%s: %v\n",
			p.RequestID, err)
	}
}

// onEventRequestRejected reacts when a recipient rejects an event request (UC8).
// It cancels every placeholder event linked to the request (sender + all recipients).
func (c *Choreographer) onEventRequestRejected(e eventbus.Event) {
	p, ok := e.Payload.(EventRequestResponsePayload)
	if !ok {
		return
	}
	ctx := context.Background()

	// Cancel all placeholder events for this request.
	if err := c.eventService.UpdateStatusByRequestID(ctx, p.RequestID, "cancelled"); err != nil {
		fmt.Printf("[choreographer] failed to cancel placeholder events request=%s: %v\n",
			p.RequestID, err)
	}
}

// onManualEventCreated reacts when a user adds a manual calendar event (UC6).
func (c *Choreographer) onManualEventCreated(e eventbus.Event) {
	p, ok := e.Payload.(ManualEventCreatedPayload)
	if !ok {
		return
	}
	fmt.Printf("[choreographer] event.manual_created eventID=%s user=%s",
		p.EventID, p.UserID)
}
