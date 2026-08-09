import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Histeria E-Commerce API',
            version: '1.0.0',
            description:
                'Production-ready REST API for the Histeria e-commerce platform. ' +
                'Admin routes require a Bearer JWT obtained from POST /api/auth/login.',
            contact: { name: 'Histeria Dev Team' },
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Local Development' },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token returned by POST /api/auth/login',
                },
            },
            schemas: {
                // ── Generic wrappers ─────────────────────────────────────────────
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Descriptive error message' },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 20 },
                        total: { type: 'integer', example: 100 },
                        totalPages: { type: 'integer', example: 5 },
                    },
                },

                // ── Category ─────────────────────────────────────────────────────
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Electronics' },
                        description: { type: 'string', nullable: true },
                        order: { type: 'integer', example: 0 },
                        image_url: { type: 'string', format: 'uri', nullable: true },
                        is_active: { type: 'boolean', example: true },
                        parent_id: { type: 'string', format: 'uuid', nullable: true },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                CategoryCreate: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Electronics' },
                        description: { type: 'string', nullable: true },
                        order: { type: 'integer', example: 0, default: 0 },
                        image_url: { type: 'string', format: 'uri', nullable: true },
                        is_active: { type: 'boolean', default: true },
                        parent_id: { type: 'string', format: 'uuid', nullable: true },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                    },
                },

                // ── Brand ────────────────────────────────────────────────────────
                Brand: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Nike' },
                        order: { type: 'integer', example: 0 },
                        link: { type: 'string', format: 'uri', nullable: true },
                        image_url: { type: 'string', format: 'uri', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                BrandCreate: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Nike' },
                        order: { type: 'integer', default: 0 },
                        link: { type: 'string', format: 'uri', nullable: true },
                        image_url: { type: 'string', format: 'uri', nullable: true },
                    },
                },

                // ── Product ──────────────────────────────────────────────────────
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Air Max 90' },
                        description: { type: 'string', nullable: true },
                        category_id: { type: 'string', format: 'uuid' },
                        brand_id: { type: 'string', format: 'uuid' },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                ProductCreate: {
                    type: 'object',
                    required: ['name', 'category_id', 'brand_id'],
                    properties: {
                        name: { type: 'string', example: 'Air Max 90' },
                        description: { type: 'string', nullable: true },
                        category_id: { type: 'string', format: 'uuid' },
                        brand_id: { type: 'string', format: 'uuid' },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                    },
                },

                // ── ProductOption ────────────────────────────────────────────────
                ProductOption: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        product_id: { type: 'string', format: 'uuid' },
                        color_name: { type: 'string', nullable: true, example: 'Red' },
                        size: { type: 'string', nullable: true, example: 'XL' },
                        price: { type: 'number', format: 'decimal', example: 129.99 },
                        color: { type: 'string', nullable: true, example: '#ff0000' },
                        image_url: { type: 'string', format: 'uri', nullable: true },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                ProductOptionCreate: {
                    type: 'object',
                    required: ['product_id', 'price'],
                    properties: {
                        product_id: { type: 'string', format: 'uuid' },
                        color_name: { type: 'string', nullable: true },
                        size: { type: 'string', nullable: true },
                        price: { type: 'number', example: 129.99 },
                        color: { type: 'string', nullable: true },
                        image_url: { type: 'string', format: 'uri', nullable: true },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                    },
                },

                // ── ProductImage ─────────────────────────────────────────────────
                ProductImage: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        product_id: { type: 'string', format: 'uuid' },
                        image_url: { type: 'string', format: 'uri' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                ProductImageCreate: {
                    type: 'object',
                    required: ['product_id', 'image_url'],
                    properties: {
                        product_id: { type: 'string', format: 'uuid' },
                        image_url: { type: 'string', format: 'uri' },
                    },
                },

                // ── Slider ───────────────────────────────────────────────────────
                Slider: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Summer Sale' },
                        description: { type: 'string', nullable: true },
                        interval: { type: 'integer', example: 5000, description: 'Slide duration in ms' },
                        image_url: { type: 'string', format: 'uri' },
                        is_active: { type: 'boolean' },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                SliderCreate: {
                    type: 'object',
                    required: ['name', 'image_url'],
                    properties: {
                        name: { type: 'string', example: 'Summer Sale' },
                        description: { type: 'string', nullable: true },
                        interval: { type: 'integer', default: 5000 },
                        image_url: { type: 'string', format: 'uri' },
                        is_active: { type: 'boolean', default: true },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                    },
                },

                // ── Ad ───────────────────────────────────────────────────────────
                Ad: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        description: { type: 'string', nullable: true },
                        display_order: { type: 'integer', example: 0 },
                        image_url: { type: 'string', format: 'uri' },
                        is_active: { type: 'boolean' },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                AdCreate: {
                    type: 'object',
                    required: ['image_url'],
                    properties: {
                        description: { type: 'string', nullable: true },
                        display_order: { type: 'integer', default: 0 },
                        image_url: { type: 'string', format: 'uri' },
                        is_active: { type: 'boolean', default: true },
                        arabic: { type: 'string', nullable: true },
                        hebrew: { type: 'string', nullable: true },
                    },
                },

                // ── Coupon ───────────────────────────────────────────────────────
                Coupon: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Summer Discount' },
                        code: { type: 'string', example: 'SAVE20' },
                        from_date: { type: 'string', format: 'date-time', nullable: true },
                        to_date: { type: 'string', format: 'date-time', nullable: true },
                        amount: { type: 'number', nullable: true, example: 15.0 },
                        percentage: { type: 'integer', nullable: true, example: 20 },
                        is_active: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                CouponCreate: {
                    type: 'object',
                    required: ['name', 'code'],
                    properties: {
                        name: { type: 'string', example: 'Summer Discount' },
                        code: { type: 'string', example: 'SAVE20' },
                        from_date: { type: 'string', format: 'date-time', nullable: true },
                        to_date: { type: 'string', format: 'date-time', nullable: true },
                        amount: {
                            type: 'number', nullable: true, example: 15.0,
                            description: 'Fixed discount amount. Mutually exclusive with percentage.',
                        },
                        percentage: {
                            type: 'integer', nullable: true, example: 20,
                            description: 'Percentage discount (0-100). Mutually exclusive with amount.',
                        },
                        is_active: { type: 'boolean', default: true },
                    },
                },
            },

            // ── Reusable responses ──────────────────────────────────────────────
            responses: {
                Unauthorized: {
                    description: 'Missing or invalid Bearer token',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                NotFound: {
                    description: 'Resource not found',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                Conflict: {
                    description: 'Unique constraint violation',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
                ValidationError: {
                    description: 'Request body validation failed',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
                },
            },

            // ── Reusable parameters ─────────────────────────────────────────────
            parameters: {
                Id: {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'Resource UUID',
                },
                PageQuery: {
                    name: 'page',
                    in: 'query',
                    schema: { type: 'integer', default: 1, minimum: 1 },
                },
                LimitQuery: {
                    name: 'limit',
                    in: 'query',
                    schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
                },
            },
        },

        // ─────────────────────────────────────────────────────────────────────
        // PATHS
        // ─────────────────────────────────────────────────────────────────────
        paths: {
            // ── Auth ────────────────────────────────────────────────────────────
            '/api/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Admin login',
                    description: 'Returns a signed JWT valid for the configured expiry period.',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['username', 'password'],
                                    properties: {
                                        username: { type: 'string', example: 'admin' },
                                        password: { type: 'string', example: 'changeme' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: {
                                                type: 'object',
                                                properties: { token: { type: 'string', example: 'eyJhbGci...' } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        400: { $ref: '#/components/responses/ValidationError' },
                        401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                    },
                },
            },

            // ── Upload ──────────────────────────────────────────────────────────
            '/api/admin/uploads/image': {
                post: {
                    tags: ['Uploads'],
                    summary: 'Upload an image to Cloudflare R2',
                    description: 'Accepts a multipart/form-data upload under the field **file**. Returns the public CDN URL.',
                    security: [{ BearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: { type: 'string', format: 'binary', description: 'JPEG, PNG or WEBP — max 5 MB' },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: 'Upload successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: { type: 'object', properties: { url: { type: 'string', format: 'uri' } } },
                                        },
                                    },
                                },
                            },
                        },
                        400: { $ref: '#/components/responses/ValidationError' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                    },
                },
            },

            // ── Categories (public) ──────────────────────────────────────────────
            '/api/categories': {
                get: {
                    tags: ['Categories'],
                    summary: 'List active categories (public)',
                    parameters: [
                        { $ref: '#/components/parameters/PageQuery' },
                        { $ref: '#/components/parameters/LimitQuery' },
                    ],
                    responses: {
                        200: {
                            description: 'Paginated list of active categories',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                                            pagination: { $ref: '#/components/schemas/Pagination' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/api/categories/{id}': {
                get: {
                    tags: ['Categories'],
                    summary: 'Get a single active category (public)',
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: {
                        200: { description: 'Category detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
            },

            // ── Categories (admin) ───────────────────────────────────────────────
            '/api/admin/categories': {
                get: {
                    tags: ['Admin / Categories'],
                    summary: 'List all categories (admin)',
                    security: [{ BearerAuth: [] }],
                    parameters: [
                        { $ref: '#/components/parameters/PageQuery' },
                        { $ref: '#/components/parameters/LimitQuery' },
                    ],
                    responses: {
                        200: { description: 'Paginated list' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                    },
                },
                post: {
                    tags: ['Admin / Categories'],
                    summary: 'Create a category',
                    security: [{ BearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } },
                    },
                    responses: {
                        201: { description: 'Created category' },
                        400: { $ref: '#/components/responses/ValidationError' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        409: { $ref: '#/components/responses/Conflict' },
                    },
                },
            },
            '/api/admin/categories/{id}': {
                get: {
                    tags: ['Admin / Categories'],
                    summary: 'Get category by ID (admin)',
                    security: [{ BearerAuth: [] }],
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: {
                        200: { description: 'Category detail' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
                put: {
                    tags: ['Admin / Categories'],
                    summary: 'Update a category',
                    security: [{ BearerAuth: [] }],
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryCreate' } } },
                    },
                    responses: {
                        200: { description: 'Updated category' },
                        400: { $ref: '#/components/responses/ValidationError' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
                delete: {
                    tags: ['Admin / Categories'],
                    summary: 'Delete a category',
                    security: [{ BearerAuth: [] }],
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: {
                        200: { description: 'Deleted successfully' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
            },

            // ── Brands ───────────────────────────────────────────────────────────
            '/api/brands': {
                get: {
                    tags: ['Brands'],
                    summary: 'List all brands (public)',
                    parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }],
                    responses: { 200: { description: 'Paginated list of brands' } },
                },
            },
            '/api/brands/{id}': {
                get: {
                    tags: ['Brands'],
                    summary: 'Get brand (public)',
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: { 200: { description: 'Brand detail' }, 404: { $ref: '#/components/responses/NotFound' } },
                },
            },
            '/api/admin/brands': {
                get: {
                    tags: ['Admin / Brands'],
                    summary: 'List all brands (admin)',
                    security: [{ BearerAuth: [] }],
                    parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }],
                    responses: { 200: { description: 'Paginated list' }, 401: { $ref: '#/components/responses/Unauthorized' } },
                },
                post: {
                    tags: ['Admin / Brands'],
                    summary: 'Create a brand',
                    security: [{ BearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BrandCreate' } } } },
                    responses: {
                        201: { description: 'Brand created' },
                        400: { $ref: '#/components/responses/ValidationError' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                    },
                },
            },
            '/api/admin/brands/{id}': {
                get: { tags: ['Admin / Brands'], summary: 'Get brand (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Brand detail' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                put: { tags: ['Admin / Brands'], summary: 'Update brand', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BrandCreate' } } } }, responses: { 200: { description: 'Updated' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                delete: { tags: ['Admin / Brands'], summary: 'Delete brand', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Deleted' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },

            // ── Products ─────────────────────────────────────────────────────────
            '/api/products': {
                get: {
                    tags: ['Products'],
                    summary: 'List products (public)',
                    parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }],
                    responses: { 200: { description: 'Paginated product list with nested category, brand, options and images' } },
                },
            },
            '/api/products/{id}': {
                get: {
                    tags: ['Products'],
                    summary: 'Get product (public)',
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: { 200: { description: 'Full product detail' }, 404: { $ref: '#/components/responses/NotFound' } },
                },
            },
            '/api/admin/products': {
                get: { tags: ['Admin / Products'], summary: 'List products (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Paginated list' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
                post: { tags: ['Admin / Products'], summary: 'Create product', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductCreate' } } } }, responses: { 201: { description: 'Product created' }, 400: { $ref: '#/components/responses/ValidationError' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
            },
            '/api/admin/products/{id}': {
                get: { tags: ['Admin / Products'], summary: 'Get product (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Product detail' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                put: { tags: ['Admin / Products'], summary: 'Update product', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductCreate' } } } }, responses: { 200: { description: 'Updated' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                delete: { tags: ['Admin / Products'], summary: 'Delete product (also deletes options & images from R2)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Deleted' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },

            // ── Product Options ──────────────────────────────────────────────────
            '/api/product-options': {
                get: { tags: ['Product Options'], summary: 'List product options (public)', parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Paginated list' } } },
            },
            '/api/product-options/{id}': {
                get: { tags: ['Product Options'], summary: 'Get product option (public)', parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Option detail' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },
            '/api/admin/product-options': {
                get: { tags: ['Admin / Product Options'], summary: 'List options (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Paginated list' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
                post: { tags: ['Admin / Product Options'], summary: 'Create option', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductOptionCreate' } } } }, responses: { 201: { description: 'Option created' }, 400: { $ref: '#/components/responses/ValidationError' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
            },
            '/api/admin/product-options/{id}': {
                get: { tags: ['Admin / Product Options'], summary: 'Get option (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Option detail' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                put: { tags: ['Admin / Product Options'], summary: 'Update option', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductOptionCreate' } } } }, responses: { 200: { description: 'Updated' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                delete: { tags: ['Admin / Product Options'], summary: 'Delete option', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Deleted' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },

            // ── Product Images ───────────────────────────────────────────────────
            '/api/product-images': {
                get: { tags: ['Product Images'], summary: 'List product images (public)', parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Paginated list' } } },
            },
            '/api/product-images/{id}': {
                get: { tags: ['Product Images'], summary: 'Get product image (public)', parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Image detail' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },
            '/api/admin/product-images': {
                get: { tags: ['Admin / Product Images'], summary: 'List product images (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Paginated list' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
                post: { tags: ['Admin / Product Images'], summary: 'Add product image', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductImageCreate' } } } }, responses: { 201: { description: 'Image record created' }, 400: { $ref: '#/components/responses/ValidationError' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
            },
            '/api/admin/product-images/{id}': {
                get: { tags: ['Admin / Product Images'], summary: 'Get product image (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Image detail' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                put: { tags: ['Admin / Product Images'], summary: 'Update product image', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductImageCreate' } } } }, responses: { 200: { description: 'Updated' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                delete: { tags: ['Admin / Product Images'], summary: 'Delete product image (also removes from R2)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Deleted' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },

            // ── Sliders ──────────────────────────────────────────────────────────
            '/api/sliders': {
                get: { tags: ['Sliders'], summary: 'List active sliders (public)', parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Only sliders where is_active=true are returned' } } },
            },
            '/api/sliders/{id}': {
                get: { tags: ['Sliders'], summary: 'Get active slider (public)', parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Slider detail' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },
            '/api/admin/sliders': {
                get: { tags: ['Admin / Sliders'], summary: 'List all sliders (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Paginated list (all active states)' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
                post: { tags: ['Admin / Sliders'], summary: 'Create slider', security: [{ BearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SliderCreate' } } } }, responses: { 201: { description: 'Slider created' }, 400: { $ref: '#/components/responses/ValidationError' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
            },
            '/api/admin/sliders/{id}': {
                get: { tags: ['Admin / Sliders'], summary: 'Get slider (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Slider detail' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                put: { tags: ['Admin / Sliders'], summary: 'Update slider', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SliderCreate' } } } }, responses: { 200: { description: 'Updated' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                delete: { tags: ['Admin / Sliders'], summary: 'Delete slider', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Deleted' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },

            // ── Ads ──────────────────────────────────────────────────────────────
            '/api/ads': {
                get: {
                    tags: ['Ads'],
                    summary: 'List active ads (public)',
                    parameters: [
                        { $ref: '#/components/parameters/PageQuery' },
                        { $ref: '#/components/parameters/LimitQuery' },
                    ],
                    responses: {
                        200: {
                            description: 'Paginated list of active ads',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: { type: 'array', items: { $ref: '#/components/schemas/Ad' } },
                                            pagination: { $ref: '#/components/schemas/Pagination' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/api/ads/{id}': {
                get: {
                    tags: ['Ads'],
                    summary: 'Get active ad by ID (public)',
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: {
                        200: { description: 'Ad detail', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
            },
            '/api/admin/ads': {
                get: {
                    tags: ['Admin / Ads'],
                    summary: 'List all ads (admin)',
                    security: [{ BearerAuth: [] }],
                    parameters: [
                        { $ref: '#/components/parameters/PageQuery' },
                        { $ref: '#/components/parameters/LimitQuery' },
                    ],
                    responses: {
                        200: { description: 'Paginated list' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                    },
                },
                post: {
                    tags: ['Admin / Ads'],
                    summary: 'Create an ad',
                    security: [{ BearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AdCreate' } } },
                    },
                    responses: {
                        201: { description: 'Created ad' },
                        400: { $ref: '#/components/responses/ValidationError' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                    },
                },
            },
            '/api/admin/ads/{id}': {
                get: {
                    tags: ['Admin / Ads'],
                    summary: 'Get ad by ID (admin)',
                    security: [{ BearerAuth: [] }],
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: {
                        200: { description: 'Ad detail' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
                put: {
                    tags: ['Admin / Ads'],
                    summary: 'Update an ad',
                    security: [{ BearerAuth: [] }],
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/AdCreate' } } },
                    },
                    responses: {
                        200: { description: 'Updated ad' },
                        400: { $ref: '#/components/responses/ValidationError' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
                delete: {
                    tags: ['Admin / Ads'],
                    summary: 'Delete an ad',
                    security: [{ BearerAuth: [] }],
                    parameters: [{ $ref: '#/components/parameters/Id' }],
                    responses: {
                        200: { description: 'Deleted ad' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        404: { $ref: '#/components/responses/NotFound' },
                    },
                },
            },

            // ── Coupons ──────────────────────────────────────────────────────────
            '/api/coupons/{code}': {
                get: {
                    tags: ['Coupons'],
                    summary: 'Validate a coupon code (public)',
                    description: 'Returns discount info if the coupon is valid and within its active date range. The code is case-insensitive.',
                    parameters: [
                        { name: 'code', in: 'path', required: true, schema: { type: 'string' }, example: 'SAVE20' },
                    ],
                    responses: {
                        200: {
                            description: 'Valid coupon',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: true },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    code: { type: 'string' },
                                                    percentage: { type: 'integer', nullable: true },
                                                    amount: { type: 'number', nullable: true },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: 'Coupon expired or not yet active' },
                        404: { description: 'Invalid or inactive coupon code' },
                    },
                },
            },
            '/api/admin/coupons': {
                get: { tags: ['Admin / Coupons'], summary: 'List coupons (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/PageQuery' }, { $ref: '#/components/parameters/LimitQuery' }], responses: { 200: { description: 'Paginated list' }, 401: { $ref: '#/components/responses/Unauthorized' } } },
                post: {
                    tags: ['Admin / Coupons'],
                    summary: 'Create coupon',
                    description: 'Exactly one of **amount** or **percentage** must be provided.',
                    security: [{ BearerAuth: [] }],
                    requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CouponCreate' } } } },
                    responses: { 201: { description: 'Coupon created' }, 400: { $ref: '#/components/responses/ValidationError' }, 401: { $ref: '#/components/responses/Unauthorized' }, 409: { $ref: '#/components/responses/Conflict' } },
                },
            },
            '/api/admin/coupons/{id}': {
                get: { tags: ['Admin / Coupons'], summary: 'Get coupon (admin)', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Coupon detail' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                put: { tags: ['Admin / Coupons'], summary: 'Update coupon', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CouponCreate' } } } }, responses: { 200: { description: 'Updated' }, 400: { $ref: '#/components/responses/ValidationError' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
                delete: { tags: ['Admin / Coupons'], summary: 'Delete coupon', security: [{ BearerAuth: [] }], parameters: [{ $ref: '#/components/parameters/Id' }], responses: { 200: { description: 'Deleted' }, 401: { $ref: '#/components/responses/Unauthorized' }, 404: { $ref: '#/components/responses/NotFound' } } },
            },
        },

        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Uploads', description: 'File upload to Cloudflare R2' },
            { name: 'Categories', description: 'Public category endpoints' },
            { name: 'Brands', description: 'Public brand endpoints' },
            { name: 'Products', description: 'Public product endpoints' },
            { name: 'Product Options', description: 'Public product option endpoints' },
            { name: 'Product Images', description: 'Public product image endpoints' },
            { name: 'Sliders', description: 'Public slider endpoints' },
            { name: 'Ads', description: 'Public ad endpoints' },
            { name: 'Coupons', description: 'Public coupon validation' },
            { name: 'Admin / Categories', description: 'Admin CRUD for categories' },
            { name: 'Admin / Brands', description: 'Admin CRUD for brands' },
            { name: 'Admin / Products', description: 'Admin CRUD for products' },
            { name: 'Admin / Product Options', description: 'Admin CRUD for product options' },
            { name: 'Admin / Product Images', description: 'Admin CRUD for product images' },
            { name: 'Admin / Sliders', description: 'Admin CRUD for sliders' },
            { name: 'Admin / Ads', description: 'Admin CRUD for ads' },
            { name: 'Admin / Coupons', description: 'Admin CRUD for coupons' },
        ],
    },
    // No apis needed – we define everything above inline
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
