# POS Sync - Shopify App

A Shopify app that synchronizes products and categories from your POS (Point of Sale) system to your Shopify store automatically. This app is designed to work with TheOneAPIPOS system and supports encrypted API responses.

## Features

- **Automatic Sync**: Schedule automatic synchronization hourly, every 6 hours, every 12 hours, or daily
- **Manual Sync**: Trigger manual sync anytime from the app dashboard
- **Category to Collection**: POS categories are synced as Shopify collections (supports main categories and subcategories)
- **Product Sync**: Products are synced with titles (English/Arabic), descriptions, prices, SKUs, barcodes, and images
- **Encrypted API Support**: Supports AES-256-CBC encrypted API responses from your POS system
- **Rate Limiting**: Built-in rate limiting for Shopify GraphQL API to prevent hitting rate limits
- **Sync Logs**: Track all synchronization history with detailed logs and error reporting
- **Multi-Store Support**: Supports multiple Shopify stores with independent configurations

## Tech Stack

- **Framework**: [Remix](https://remix.run/) with [Shopify App Remix](https://shopify.dev/docs/apps/tools/cli/getting-started)
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/) (Note: Consider PostgreSQL for production with high traffic)
- **UI**: [Shopify Polaris](https://polaris.shopify.com/)
- **Scheduling**: [node-cron](https://github.com/node-cron/node-cron) for automatic synchronization
- **Encryption**: [crypto-js](https://github.com/brix/crypto-js) for AES-256-CBC decryption
- **Rate Limiting**: Custom token bucket implementation for Shopify GraphQL API

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or yarn
- [Shopify Partner account](https://partners.shopify.com/)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/installation)

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/shopify-pos-sync.git
   cd shopify-pos-sync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run setup
   ```

4. Create a `.env` file with your Shopify app credentials:
   ```env
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=read_products,write_products,read_product_listings,write_product_listings,read_inventory,write_inventory
   HOST=https://your-app-url.com
   DATABASE_URL=file:./dev.db
   SHOP_CUSTOM_DOMAIN=your-custom-domain.com  # Optional: for custom shop domains
   NODE_ENV=development  # or production
   ```
   
   **Important**: All environment variables are validated on app startup. Missing required variables will cause the app to fail with a clear error message.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Creating a Shopify App

1. Log in to your [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Go to Apps → Create app
3. Choose "Create app manually"
4. Fill in the app details:
   - App name: POS Sync
   - App URL: Your deployed app URL (e.g., `https://theonesystemco.tek-part.com`)
   - Allowed redirection URLs: `{your-url}/auth/callback`, `{your-url}/auth/shopify/callback`

5. Copy the API key and secret to your `.env` file

### Configuration Files

This project uses two Shopify configuration files:

- **`shopify.app.pos-sync.toml`**: Production configuration file (active)
- **`shopify.app.toml`**: Template/example configuration file

The production config (`shopify.app.pos-sync.toml`) is the active configuration used by the Shopify CLI. The other file serves as a template for development or additional environments.

### Configuration

After installing the app on a Shopify store:

1. Navigate to **Settings** in the app
2. Enter your POS API configuration:
   - **Base URL**: The base URL of your POS API (e.g., `http://api.example.com/pos/api/`)
   - **Username**: Basic Auth username
   - **Password**: Basic Auth password
   - **Encryption Key**: 32-character AES-256 encryption key
   - **IV**: 16-character initialization vector
   - **Sync Frequency**: How often to automatically sync (hourly/daily/etc.)

3. Click **Test Connection** to verify the settings
4. Click **Save Settings**

## Rate Limiting

The app includes built-in rate limiting for Shopify GraphQL API requests to prevent hitting Shopify's rate limits:

- **Token Bucket Algorithm**: Implements a token bucket with configurable refill rate
- **Automatic Retry**: Automatically retries requests when rate limited (429 errors)
- **Cost Estimation**: Estimates query cost based on complexity
- **Per-Shop Limiting**: Rate limits are tracked per shop domain
- **Conservative Defaults**: Uses 80% of Shopify's standard plan limits (80 points/second) to stay safe

The rate limiter automatically handles:
- Waiting for available tokens before making requests
- Exponential backoff on rate limit errors
- Parsing `Retry-After` headers
- Adjusting token counts based on actual query costs from Shopify responses

## POS API Requirements

This app is designed to work with TheOneAPIPOS system. Your POS system API should expose the following endpoints:

### Categories
- `GET /Category/GetMainCategory` - Get all main categories
- `GET /Category/GetCategoryByParentId?parentId={id}` - Get subcategories

### Products
- `GET /Product/Get?page={page}&pageSize={size}` - Get paginated products

### Expected Response Format

Responses can be:
1. Plain JSON
2. AES-256-CBC encrypted string (will be decrypted using provided key/IV)

#### Category Structure
```json
{
  "CategoryID": 1,
  "CategoryCode": "CAT001",
  "CategoryName": "Electronics",
  "CategoryNameAr": "إلكترونيات",
  "CategoryNameEn": "Electronics",
  "ParentID": null,
  "IsActive": true
}
```

#### Product Structure
```json
{
  "ProductID": 1,
  "ProductCode": "PROD001",
  "ProductName": "Smartphone",
  "ProductNameAr": "هاتف ذكي",
  "ProductNameEn": "Smartphone",
  "Description": "A great smartphone",
  "Price": 999.99,
  "CategoryID": 1,
  "Barcode": "1234567890123",
  "ImageURL": "https://example.com/image.jpg",
  "IsActive": true
}
```

## Deployment

### Environment Variables

**Required variables** (validated on startup):
- `SHOPIFY_API_KEY` - Your Shopify app API key
- `SHOPIFY_API_SECRET` - Your Shopify app API secret
- `HOST` - Your app's public URL (e.g., `https://theonesystemco.tek-part.com`)
- `SCOPES` - Comma-separated list of Shopify API scopes
- `DATABASE_URL` - Database connection string

**Optional variables**:
- `SHOP_CUSTOM_DOMAIN` - Custom shop domain if applicable
- `NODE_ENV` - Environment (development/production)

### Fly.io

```bash
flyctl launch
flyctl secrets set SHOPIFY_API_KEY=xxx SHOPIFY_API_SECRET=xxx HOST=https://your-app.fly.dev SCOPES="read_products,write_products,..."
flyctl deploy
```

### Render

1. Connect your GitHub repository to Render
2. Create a new Web Service using `render.yaml`
3. Add all required environment variables in the Render dashboard
4. The scheduler will automatically start on deployment

### Railway

1. Connect your GitHub repository to Railway
2. Railway will auto-detect the configuration from `railway.toml`
3. Add all required environment variables in the Railway dashboard
4. The app will validate environment variables on startup

### Hostinger / Other Hosting

See `HOSTINGER_SETUP.md` and `DEPLOYMENT_HOSTINGER.md` for detailed Hostinger deployment instructions.

**Important Notes**:
- The scheduler initializes automatically in all environments
- Environment variables are validated on startup - missing variables will cause startup failure
- Ensure your database is properly configured and accessible
- The app uses SQLite by default - consider PostgreSQL for production with high traffic

## Project Structure

```
shopify-pos-sync/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx      # Dashboard with sync status
│   │   ├── app.settings.tsx    # POS API Configuration
│   │   ├── app.sync.tsx        # Manual sync trigger
│   │   ├── app.logs.tsx        # Sync history and logs
│   │   └── app.tsx             # App layout wrapper
│   ├── services/
│   │   ├── pos-api.server.ts   # POS API client with AES decryption
│   │   ├── shopify-sync.server.ts  # Main Shopify sync orchestration
│   │   ├── scheduler.server.ts # Cron job scheduler (auto-initializes)
│   │   └── rate-limiter.server.ts  # Shopify API rate limiting
│   ├── models/
│   │   └── settings.server.ts  # Database operations for settings/logs
│   ├── shopify.server.ts       # Shopify app initialization (with env validation)
│   └── db.server.ts            # Prisma database client
├── prisma/
│   └── schema.prisma           # Database schema (Shop, SyncLog models)
├── shopify.app.pos-sync.toml   # Production Shopify app config
├── shopify.app.toml            # Template/example config
├── api/                        # Legacy PHP API files (may not be in use)
└── package.json
```

## Scheduler

The scheduler automatically initializes on app startup (in all environments, not just production). It:

- Loads all configured shops from the database
- Schedules sync jobs based on each shop's sync frequency
- Supports: hourly, every 6 hours, every 12 hours, or daily
- Can be manually triggered from the app dashboard
- Logs all sync operations with success/failure status

## Development Notes

### Rate Limiting

The app implements rate limiting to prevent hitting Shopify's API limits. The rate limiter:
- Uses a token bucket algorithm
- Tracks rate limits per shop domain
- Automatically retries on 429 errors
- Estimates query costs to manage token usage

### Scheduler Behavior

- **Auto-initialization**: The scheduler starts automatically when the app loads (all environments)
- **Database-driven**: Schedules are loaded from the database on startup
- **Per-shop configuration**: Each shop can have its own sync frequency
- **Manual triggers**: Syncs can be triggered manually from the dashboard

### Error Handling

- All sync operations are logged to the database
- Errors are captured and displayed in the sync logs
- Failed syncs can be retried manually
- Rate limit errors are automatically handled with retries

## Troubleshooting

### App won't start
- Check that all required environment variables are set
- Verify database connection string is correct
- Check that Prisma schema is up to date (`npm run setup`)

### Sync not running automatically
- Verify the shop is configured in Settings
- Check that sync frequency is set
- Review scheduler logs in the console
- Ensure the app is running (scheduler only runs when app is active)

### Rate limit errors
- The rate limiter should handle this automatically
- If issues persist, check Shopify API status
- Consider reducing sync frequency for large catalogs

## License

MIT License

## Support

For questions or issues, please check the deployment documentation files or open a GitHub issue.
