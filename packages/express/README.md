# @latta/express

![Latta logo](../../docs/logo.svg)

[![npm version](https://badge.fury.io/js/@latta%2Fexpress.svg)](https://www.npmjs.com/package/@latta/express)

> Seamlessly integrate exception monitoring into your Express applications with Latta

## Overview

The `@latta/express` library provides robust error tracking and monitoring for your Express applications. It automatically captures and reports both process-level exceptions and request-specific errors to the Latta reporting system, giving you comprehensive insight into your application's health.

## Features

- 🔄 Automatic exception handling
- 🚀 Quick & easy setup
- 🛠️ Customizable options
- 📊 Comprehensive error reporting

## Installation

Install the package using npm:

```bash
npm install @latta/express
```

or using yarn:

```bash
yarn add @latta/express
```

or using your favourite package manager.

## Quick Start

Adding Latta to your Express application requires just one line of code:

```typescript
import { latta } from '@latta/express';
import express from 'express';

// Get your API key from the Latta dashboard or use environment variables
const LATTA_API_KEY = process.env.LATTA_API_KEY || "<your-api-key>";

const app = express();

// Add Latta middleware
app.use(latta(LATTA_API_KEY));

// Your existing routes and middleware
```

## Configuration

### Client Initialization

The Latta client is implemented as Express middleware and accepts two parameters:

```typescript
import { latta } from '@latta/express';

const middleware = latta(
  "API_KEY",
  {
    verbose: true // Enable detailed logging
  }
);

app.use(middleware);
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | boolean | `false` | When enabled, Latta will log detailed information to the console |

```typescript
interface LattaOptions {
  verbose: boolean;  // Enable/disable detailed logging
}
```

## Debugging

To assist with troubleshooting, you can enable verbose logging:

```typescript
app.use(latta(LATTA_API_KEY, { verbose: true }));
```

This will output detailed information about Latta's operation to the console.

## Examples

### Basic Usage

```typescript
import express from 'express';
import { latta } from '@latta/express';

const app = express();

app.use(latta(process.env.LATTA_API_KEY));

app.get('/api/data', (req, res) => {
  // Your route logic here
});

app.listen(3000, () => {
  console.log('Server running with Latta error monitoring');
});
```

## Best Practices

1. Use environment variables for your API key
2. Add Latta middleware early in your middleware chain
3. Enable verbose logging during development


## Support

If you encounter any issues or need assistance:

- Email: [support@latta.ai](mailto:support@latta.ai)
- Website: [https://latta.ai](https://latta.ai)


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ by the Latta Team</strong>
</div>