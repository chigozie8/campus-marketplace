export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'VendorX API',
    version: '2.0.0',
    description: 'VendorX — WhatsApp + Social Marketplace Backend API',
    contact: { name: 'VendorX Team' },
  },
  servers: [
    { url: '/api', description: 'VendorX API' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          stock_quantity: { type: 'integer' },
          image_url: { type: 'string' },
          vendor_id: { type: 'string', format: 'uuid' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          buyer_id: { type: 'string', format: 'uuid' },
          vendor_id: { type: 'string', format: 'uuid' },
          product_id: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer' },
          total_amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled'] },
          delivery_address: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'full_name', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  full_name: { type: 'string' },
                  role: { type: 'string', enum: ['buyer', 'vendor'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful — returns JWT tokens' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile data' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List products with filtering and pagination',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'category', schema: { type: 'string' } },
          { in: 'query', name: 'min_price', schema: { type: 'number' } },
          { in: 'query', name: 'max_price', schema: { type: 'number' } },
          { in: 'query', name: 'sort', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc'] } },
        ],
        responses: { 200: { description: 'Paginated product list' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create a product (vendor/admin)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Product created' }, 403: { description: 'Forbidden' } },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product data' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update product (vendor/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product (vendor/admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create an order',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Order created' } },
      },
    },
    '/orders/me': {
      get: {
        tags: ['Orders'],
        summary: 'Get current user orders',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Paginated orders' } },
      },
    },
    '/orders/{id}/pay': {
      post: {
        tags: ['Payments'],
        summary: 'Initialize payment for an order',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Paystack payment link returned' } },
      },
    },
    '/orders/verify/{reference}': {
      get: {
        tags: ['Payments'],
        summary: 'Verify payment by reference',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'reference', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Payment verified' } },
      },
    },
    '/webhooks/paystack': {
      post: {
        tags: ['Webhooks'],
        summary: 'Paystack webhook receiver',
        responses: { 200: { description: 'Acknowledged' } },
      },
    },
    '/webhooks/whatsapp': {
      get: {
        tags: ['Webhooks'],
        summary: 'WhatsApp webhook verification',
        responses: { 200: { description: 'Challenge echoed' } },
      },
      post: {
        tags: ['Webhooks'],
        summary: 'Incoming WhatsApp messages',
        responses: { 200: { description: 'Acknowledged' } },
      },
    },
  },
}
