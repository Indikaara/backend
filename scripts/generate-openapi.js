const fs = require('fs');
const { logger } = require('../config/logger');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const jsYaml = require('js-yaml');
const swaggerOptions = require('../swagger.config');

const spec = swaggerJsdoc(swaggerOptions);
const outJson = path.resolve(__dirname, '..', 'openapi.json');
const outYaml = path.resolve(__dirname, '..', 'openapi.yaml');

fs.writeFileSync(outJson, JSON.stringify(spec, null, 2));
fs.writeFileSync(outYaml, jsYaml.dump(spec));

logger.info('Generated OpenAPI documentation', { files: ['openapi.json', 'openapi.yaml'] });
