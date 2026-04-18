package event

import "context"

// RequestRepository defines the persistence contract for event requests/responses.
type RequestRepository interface {
	CreateRequest(ctx context.Context, r *EventRequest) error
	FindRequestByID(ctx context.Context, id string) (*EventRequest, error)

	// ListPendingByRecipient returns pending requests the user hasn't responded to yet.
	ListPendingByRecipient(ctx context.Context, recipientID string) ([]*EventRequest, error)

	// ListByRecipient returns all requests sent to the user's groups (all statuses).
	ListByRecipient(ctx context.Context, recipientID string) ([]*EventRequest, error)

	// ListBySender returns requests created by senderID.
	ListBySender(ctx context.Context, senderID string) ([]*EventRequest, error)

	// Respond records a recipient's decision on a request.
	Respond(ctx context.Context, resp *EventResponse) error

	// ListResponses returns all responses for a given request.
	ListResponses(ctx context.Context, requestID string) ([]*EventResponse, error)

	// UpdateStatus updates the overall status of an event request.
	UpdateStatus(ctx context.Context, requestID string, status string) error

	// DeleteRequest removes a request and its responses (cascaded by FK).
	DeleteRequest(ctx context.Context, id string) error

	// DismissRequest records a per-user soft-dismissal so the request is hidden
	// from that user's inbox without affecting any other participant's view.
	DismissRequest(ctx context.Context, userID, requestID string) error
}
