# POS Sync - Shopify App

A Shopify app that synchronizes products and categories from your POS (Point of Sale) system to your Shopify store automatically.

## Features

- **Automatic Sync**: Schedule automatic synchronization hourly, daily, or at custom intervals
- **Manual Sync**: Trigger manual sync anytime from the app dashboard
- **Category to Collection**: POS categories are synced as Shopify collections
- **Product Sync**: Products are synced with titles, descriptions, prices, SKUs, and images
- **Encrypted API Support**: Supports AES-256-CBC encrypted API responses from your POS system
- **Sync Logs**: Track all synchronization history with detailed logs

## Tech Stack

- **Framework**: [Remix](https://remix.run/) with [Shopify App Remix](https://shopify.dev/docs/apps/tools/cli/getting-started)
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
- **UI**: [Shopify Polaris](https://polaris.shopify.com/)
- **Scheduling**: [node-cron](https://github.com/node-cron/node-cron)
- **Encryption**: [crypto-js](https://github.com/brix/crypto-js) for AES decryption

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
   ```

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
   - App URL: Your deployed app URL
   - Allowed redirection URLs: `{your-url}/auth/callback`, `{your-url}/auth/shopify/callback`

5. Copy the API key and secret to your `.env` file

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

## POS API Requirements

Your POS system API should expose the following endpoints:

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

### Fly.io

```bash
flyctl launch
flyctl secrets set SHOPIFY_API_KEY=xxx SHOPIFY_API_SECRET=xxx HOST=https://your-app.fly.dev
flyctl deploy
```

### Render

1. Connect your GitHub repository to Render
2. Create a new Web Service using `render.yaml`
3. Add environment variables in the Render dashboard

### Railway

1. Connect your GitHub repository to Railway
2. Railway will auto-detect the configuration from `railway.toml`
3. Add environment variables in the Railway dashboard

### Heroku

```bash
heroku create shopify-pos-sync
heroku config:set SHOPIFY_API_KEY=xxx SHOPIFY_API_SECRET=xxx HOST=https://your-app.herokuapp.com
git push heroku main
```

## Project Structure

```
shopify-pos-sync/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx      # Dashboard
│   │   ├── app.settings.tsx    # API Configuration
│   │   ├── app.sync.tsx        # Manual sync trigger
│   │   └── app.logs.tsx        # Sync history
│   ├── services/
│   │   ├── pos-api.server.ts   # POS API client with decryption
│   │   ├── shopify-sync.server.ts  # Shopify sync logic
│   │   └── scheduler.server.ts # Cron jobs
│   └── models/
│       └── settings.server.ts  # Database operations
├── prisma/
│   └── schema.prisma           # Database schema
├── shopify.app.toml            # Shopify app config
└── package.json
```

## License

MIT License

## Support

For questions or issues, please open a GitHub issue.
