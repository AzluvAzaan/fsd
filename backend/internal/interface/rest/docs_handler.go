package rest

import (
	_ "embed"
	"net/http"
)

//go:embed swagger/openapi.json
var openapiSpec []byte

// DocsHandler serves the Swagger UI and the OpenAPI spec.
type DocsHandler struct{}

// NewDocsHandler creates a new DocsHandler.
func NewDocsHandler() *DocsHandler {
	return &DocsHandler{}
}

// ServeSpec serves the raw OpenAPI JSON spec at GET /docs/openapi.json.
func (h *DocsHandler) ServeSpec(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(openapiSpec)
}

// ServeUI serves the Swagger UI HTML at GET /docs.
// The UI is loaded entirely from the unpkg CDN — no extra dependencies required.
func (h *DocsHandler) ServeUI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(swaggerHTML))
}

const swaggerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FSD API — Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; }
    #swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: "/docs/openapi.json",
        dom_id: "#swagger-ui",
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset,
        ],
        layout: "StandaloneLayout",
        deepLinking: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Automatically add the dev auth header if a user ID is stored
          var userId = localStorage.getItem("fsd_user_id");
          if (userId) {
            request.headers["X-User-ID"] = userId;
          }
          return request;
        },
      });
    };
  </script>
</body>
</html>`
