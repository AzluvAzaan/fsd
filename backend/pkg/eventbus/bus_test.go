package eventbus_test

import (
	"sync"
	"testing"

	"github.com/fsd-group/fsd/pkg/eventbus"
)

func TestPublishDeliveredToSubscriber(t *testing.T) {
	bus := eventbus.New()
	var received eventbus.Event

	bus.Subscribe("user.created", func(e eventbus.Event) {
		received = e
	})
	bus.Publish(eventbus.Event{Type: "user.created", Payload: "user-123"})

	if received.Type != "user.created" {
		t.Errorf("expected type user.created, got %s", received.Type)
	}
	if received.Payload != "user-123" {
		t.Errorf("expected payload user-123, got %v", received.Payload)
	}
}

func TestPublishDeliveredToAllSubscribersOfType(t *testing.T) {
	bus := eventbus.New()
	count := 0

	bus.Subscribe("test.event", func(e eventbus.Event) { count++ })
	bus.Subscribe("test.event", func(e eventbus.Event) { count++ })
	bus.Publish(eventbus.Event{Type: "test.event"})

	if count != 2 {
		t.Errorf("expected 2 handlers called, got %d", count)
	}
}

func TestPublishWithNoSubscribersDoesNotPanic(t *testing.T) {
	bus := eventbus.New()
	bus.Publish(eventbus.Event{Type: "nobody.listening"})
}

func TestPublishOnlyDeliveredToMatchingEventType(t *testing.T) {
	bus := eventbus.New()
	called := false

	bus.Subscribe("type.a", func(e eventbus.Event) { called = true })
	bus.Publish(eventbus.Event{Type: "type.b"})

	if called {
		t.Error("handler for type.a must not be called for type.b event")
	}
}

func TestPublishIsSafeConcurrently(t *testing.T) {
	bus := eventbus.New()
	var mu sync.Mutex
	received := 0

	bus.Subscribe("concurrent.event", func(e eventbus.Event) {
		mu.Lock()
		received++
		mu.Unlock()
	})

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			bus.Publish(eventbus.Event{Type: "concurrent.event"})
		}()
	}
	wg.Wait()

	if received != 50 {
		t.Errorf("expected 50 events received, got %d", received)
	}
}
