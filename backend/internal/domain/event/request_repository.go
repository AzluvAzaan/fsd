package event

import "context"

// RequestRepository defines the persistence contract for event requests/responses.
type RequestRepository interface {
	CreateRequest(ctx context.Context, r *EventRequest) error
	FindRequestByID(ctx context.Context, id string) (*EventRequest, error)

	// ListPendingByRecipient returns all requests where the user hasn't responded yet.
	ListPendingByRecipient(ctx context.Context, recipientID string) ([]*EventRequest, error)

	// ListBySender returns requests created by senderID.
	ListBySender(ctx context.Context, senderID string) ([]*EventRequest, error)

	// Respond records a recipient's decision on a request.
	Respond(ctx context.Context, resp *EventResponse) error

	// ListResponses returns all responses for a given request.
	ListResponses(ctx context.Context, requestID string) ([]*EventResponse, error)

	// UpdateStatus updates the overall status of an event request.
	UpdateStatus(ctx context.Context, requestID string, status string) error
}
