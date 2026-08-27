---
name: strapi-schema-gen
description: >-
  Use this skill when creating, modifying, or extending Strapi v5 content-type schemas,
  controllers, services, custom routes, and database relations for the CPS Academy backend.
---

# Strapi Schema Generation & Extension Runbook

Follow these steps when creating or modifying Strapi v5 content-types in `learning-management-system-back-end/`:

## 1. Directory Structure
For any new content-type `xyz`:
```text
src/api/xyz/
├── content-types/
│   └── xyz/
│       └── schema.json
├── controllers/
│   └── xyz.js
├── routes/
│   └── xyz.js
└── services/
    └── xyz.js
```

## 2. Creating Standard Strapi Schema (`schema.json`)
```json
{
  "kind": "collectionType",
  "collectionName": "courses",
  "info": {
    "singularName": "course",
    "pluralName": "courses",
    "displayName": "Course",
    "description": "LMS Course Schema"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "description": {
      "type": "richtext"
    },
    "price": {
      "type": "decimal",
      "required": true,
      "default": 0.00
    },
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category",
      "inversedBy": "courses"
    }
  }
}
```

## 3. Creating Core Controller, Router, and Service

### Controller (`controllers/xyz.js`)
```javascript
'use strict';
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::xyz.xyz', ({ strapi }) => ({
  // Custom controller actions here
}));
```

### Route (`routes/xyz.js`)
```javascript
'use strict';
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::xyz.xyz');
```

### Service (`services/xyz.js`)
```javascript
'use strict';
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::xyz.xyz');
```

## 4. Verification Steps
1. Verify JSON schema syntax.
2. Confirm relation target strings match existing content-types (`api::<target>.<target>`).
3. Check role permissions in Strapi Admin > Settings > Roles > Authenticated / Public.
