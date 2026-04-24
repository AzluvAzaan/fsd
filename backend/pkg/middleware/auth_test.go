
package middleware;
import "testing";
import "net/http";
import "net/http/httptest";



func TestAuth_Unauthorized(t *testing.T) {
    handler := Auth(func(w http.ResponseWriter, r *http.Request) {
        t.Errorf("handler should not be called")
    })

    req := httptest.NewRequest(http.MethodGet, "/", nil)
    rr := httptest.NewRecorder()

    handler.ServeHTTP(rr, req)

    if rr.Code != http.StatusUnauthorized {
        t.Errorf("expected 401, got %d", rr.Code)
    }
}

func TestAuth_Authorized(t *testing.T) {
    called := false

    handler := Auth(func(w http.ResponseWriter, r *http.Request) {
        called = true
    })

    req := httptest.NewRequest(http.MethodGet, "/", nil)
    req.Header.Set("X-User-ID", "user123")
    rr := httptest.NewRecorder()

    handler.ServeHTTP(rr, req)

    if !called {
        t.Errorf("expected next handler to be called")
    }
}

func TestAuth_ContextInjection(t *testing.T) {
    handler := Auth(func(w http.ResponseWriter, r *http.Request) {
        uid, ok := UserIDFromContext(r.Context())
        if !ok || uid != "user123" {
            t.Errorf("expected userID 'user123', got %v", uid)
        }
    })

    req := httptest.NewRequest(http.MethodGet, "/", nil)
    req.Header.Set("X-User-ID", "user123")
    rr := httptest.NewRecorder()

    handler.ServeHTTP(rr, req)
}
