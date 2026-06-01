export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "BharatLens Backend API",
    version: "1.0.0",
    description: "OpenAPI specification skeleton for BharatLens backend endpoints.",
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Local development server",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Service health status",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Authenticate a user",
        responses: {
          "200": {
            description: "Authentication response",
          },
        },
      },
    },
    "/api/search": {
      get: {
        summary: "Search across schemes, scholarships, jobs, and exams",
        responses: {
          "200": {
            description: "Search results",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { type: "object" },
        },
      },
    },
  },
};
