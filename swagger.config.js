const dotenv = require('dotenv');
dotenv.config();

// Build Swagger servers list: support SWAGGER_SERVERS (comma-separated), SERVER_URL, and localhost
const buildSwaggerServers = () => {
    const servers = [];
    if (process.env.SWAGGER_SERVERS) {
        const parts = process.env.SWAGGER_SERVERS.split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => {
            const [url, desc] = p.split(';;').map(x => x && x.trim());
            if (url) servers.push({ url, description: desc || 'Configured server' });
        });
    }
    if (process.env.SERVER_URL) {
        servers.push({ url: process.env.SERVER_URL, description: 'Deployment server' });
    }
    const localUrl = `http://localhost:${process.env.PORT || 5000}`;
    // During development prefer local server first so Swagger 'Try it' targets localhost
    if (!servers.find(s => s.url === localUrl)) {
        if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
            servers.unshift({ url: localUrl, description: 'Development server' });
        } else {
            servers.push({ url: localUrl, description: 'Development server' });
        }
    }
    return servers;
};

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Indikara Backend API',
            version: '1.0.0',
            description: 'API for authentication, products, and health checks',
        },
        servers: buildSwaggerServers(),
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            schemas: {
                // User
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        isAdmin: { type: 'boolean' },
                        isDemo: { type: 'boolean' }
                    }
                },
                // Product price entry
                ProductPriceEntry: {
                    type: 'object',
                    properties: {
                        size: { type: 'string' },
                        amount: { type: 'number' }
                    }
                },
                // Product
                Product: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        id: { type: 'number' },
                        name: { type: 'string' },
                        price: { type: 'array', items: { $ref: '#/components/schemas/ProductPriceEntry' } },
                        image: { type: 'array', items: { type: 'string' } },
                        story: { type: 'string' },
                        description: { type: 'string' },
                        details: { type: 'array', items: { type: 'string' } },
                        color: { type: 'array', items: { type: 'string' } },
                        weavingTechnique: { type: 'string' },
                        material: { type: 'string' },
                        manufacturer: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        SKU: { type: 'string' },
                        category: { type: 'string' },
                        categoryId: { type: 'number' }
                    }
                },
                // Order product item
                OrderProductItem: {
                    type: 'object',
                    properties: {
                        product: { type: 'string', description: 'Product ObjectId or SKU' },
                        quantity: { type: 'number' },
                        price: { type: 'number' }
                    }
                },
                // Order
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        txnid: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                        products: { type: 'array', items: { $ref: '#/components/schemas/OrderProductItem' } },
                        shippingAddress: { type: 'object' },
                        totalPrice: { type: 'number' },
                        paymentMethod: { type: 'string' },
                        paymentResult: { type: 'object', description: 'Payment gateway response / reference' },
                        isPaid: { type: 'boolean' },
                        paidAt: { type: 'string', format: 'date-time' },
                        status: { type: 'string' }
                    }
                },
                WebhookEvent: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        provider: { type: 'string' },
                        payload: { type: 'object' },
                        headers: { type: 'object' },
                        ip: { type: 'string' },
                        hashValid: { type: 'boolean' },
                        status: { type: 'string' },
                        receivedAt: { type: 'string', format: 'date-time' }
                    }
                },
                // Request/response shapes
                CreateOrderProductItem: {
                    type: 'object',
                    properties: {
                        product: { type: 'string', description: 'Product ObjectId or SKU' },
                        quantity: { type: 'number' }
                    }
                },
                CreatePendingRequest: {
                    type: 'object',
                    properties: {
                        products: { type: 'array', items: { $ref: '#/components/schemas/CreateOrderProductItem' } },
                        shippingAddress: { type: 'object' }
                    },
                    required: ['products']
                },
                CreatePendingResponse: {
                    type: 'object',
                    properties: {
                        order: { $ref: '#/components/schemas/Order' },
                        txnid: { type: 'string' }
                    }
                },
                ComputeHashRequest: {
                    type: 'object',
                    properties: {
                        txnid: { type: 'string' },
                        amount: { type: 'number' },
                        productinfo: { type: 'string' },
                        firstname: { type: 'string' },
                        email: { type: 'string', format: 'email' }
                    },
                    required: ['txnid', 'amount', 'productinfo']
                },
                ComputeHashResponse: {
                    type: 'object',
                    properties: {
                        hash: { type: 'string' },
                        key: { type: 'string' }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        token: { type: 'string' }
                    }
                }
            }
        }
    },
    apis: ['./controllers/*.js']
};

module.exports = swaggerOptions;
