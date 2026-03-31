package eventbus

import "sync"

// Handler processes a domain event.
type Handler func(Event)

// Event carries a named payload through the bus.
type Event struct {
	Type    string
	Payload any
}

// Bus is a simple in-process synchronous pub/sub event bus.
// Services publish events here; the choreographer subscribes and routes reactions.
type Bus struct {
	mu       sync.RWMutex
	handlers map[string][]Handler
}

// New returns a ready-to-use Bus.
func New() *Bus {
	return &Bus{handlers: make(map[string][]Handler)}
}

// Subscribe registers h to receive all future events of the given type.
func (b *Bus) Subscribe(eventType string, h Handler) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.handlers[eventType] = append(b.handlers[eventType], h)
}

// Publish delivers e synchronously to every registered handler for its type.
func (b *Bus) Publish(e Event) {
	b.mu.RLock()
	handlers := make([]Handler, len(b.handlers[e.Type]))
	copy(handlers, b.handlers[e.Type])
	b.mu.RUnlock()
	for _, h := range handlers {
		h(e)
	}
}
