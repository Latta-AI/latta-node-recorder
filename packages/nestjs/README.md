# @latta/nestjs

![Latta logo](../../docs/logo.svg)

[![npm version](https://badge.fury.io/js/@latta%2Fnestjs.svg)](https://www.npmjs.com/package/@latta/nestjs)

> Seamlessly integrate exception monitoring into your NestJS applications with Latta

## Overview

The `@latta/nestjs` library provides robust error tracking and monitoring for your NestJS applications. It automatically captures and reports both process-level exceptions and request-specific errors to the Latta reporting system using NestJS interceptors.

## Features

- 🔄 Automatic exception handling via interceptors
- 🚀 Quick & easy setup
- 🛠️ Customizable options
- 📊 Comprehensive error reporting
- 📝 Detailed request and response logging

## Installation

Install the package using npm:

```bash
npm install @latta/nestjs
```

Or using yarn:

```bash
yarn add @latta/nestjs
```

## Quick Start

Adding Latta to your NestJS application requires just one line of code in your bootstrap function:

```typescript
import { NestFactory } from '@nestjs/core';
import { LattaInterceptor } from '@latta/nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Add Latta interceptor
  app.useGlobalInterceptors(new LattaInterceptor(process.env.LATTA_API_KEY));
  
  await app.listen(3000);
}
bootstrap();
```

## Configuration

### Interceptor Initialization

The Latta interceptor can be configured with options:

```typescript
import { LattaInterceptor } from '@latta/nestjs';

const interceptor = new LattaInterceptor(
  process.env.LATTA_API_KEY,
  {
    verbose: true // Enable detailed logging
  }
);

app.useGlobalInterceptors(interceptor);
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | boolean | `false` | When enabled, Latta will log detailed information to the console |

```typescript
interface LattaInterceptorOptions {
  verbose?: boolean;  // Enable/disable detailed logging
}
```

## Examples

### Controller-Level Implementation

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { LattaInterceptor } from '@latta/nestjs';

@Controller('api')
@UseInterceptors(new LattaInterceptor(process.env.LATTA_API_KEY))
export class ApiController {
  @Get('data')
  getData() {
    // Your route logic here
  }
}
```

### Error Handling

Latta automatically captures errors thrown in your controllers:

```typescript
@Controller('api')
export class ApiController {
  @Get('resource')
  getResource() {
    throw new Error('This error will be captured by Latta');
  }
}
```

## Best Practices

1. Use environment variables for your API key
2. Add the Latta interceptor in your application bootstrap
3. Enable verbose logging during development

## Debugging

For debugging purposes, you can enable verbose logging:

```typescript
const interceptor = new LattaInterceptor(process.env.LATTA_API_KEY, { verbose: true });
```

This will output detailed information about Latta's operation to the console.

## Support

If you encounter any issues or need assistance:

- Email: [support@latta.ai](mailto:support@latta.ai)
- Website: [https://latta.ai](https://latta.ai)
- Documentation: [Full Documentation](https://docs.latta.ai)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ by the Latta Team</strong>
</div>