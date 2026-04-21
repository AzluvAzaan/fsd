package eventbus

import "testing"

func TestBus_PublishCallsSubscriber(t *testing.T) {
    bus := New()

    called := false

    bus.Subscribe("test.event", func(e Event) {
        called = true
    })

    bus.Publish(Event{Type: "test.event"})

    if !called {
        t.Errorf("expected handler to be called")
    }
}