# .ASAP
### All blockchain transactions in one click


dotASAP is a blockchain service that enables seamless token swaps, bridging across multiple blockchains and offramping to fiat right from your Sui wallet - you do not have to leave your send interface to do more. The system consists of three main components:

1. **Backend Engine**: Monitors and processes blockchain transactions
2. **Web Service**: Provides a user interface and API endpoints
3. **Demo Wallet**: A demonstration wallet for testing transactions

Built on top of [memo-protocol](https://github.com/dotasap/memo-protocol), a standardized protocol for encoding emitting Sui memos.

## Features

- 🔄 Cross-chain token swaps
- 🌉 Bridge transactions between chains
- 💱 Offramp to fiat currency
- 🔍 Real-time transaction monitoring
- 🔒 Secure wallet integration

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Mysten/Sui
- Paystack account (for offramping)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/dotasap/asap-engine
   cd asap-engine
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install dependencies for all services:
   ```bash
   npm run install:all
   ```

4. Set up environment variables:
   ```bash
   # Backend Engine
   cp backend-engine/.env.example backend-engine/.env
   # Web Service
   cp web-service/.env.example web-service/.env
   # Demo Wallet
   cp demo-wallet/.env.example demo-wallet/.env
   ```

5. Update the environment variables with your configuration:
   - Add your Sui keys
   - Add your Paystack API keys
   - Configure MongoDB connection
   - Set up JWT secret
   - Add your ASAP domain address (this is just for demo)

6. Start all services in development mode:
   ```bash
   npm run dev
   ```

The services will be available at:
- Web Service: http://localhost:3000
- Backend Engine: http://localhost:3001
- Demo Wallet: http://localhost:5173

## Project Structure

```
asap-engine/
├── backend-engine/     # Transaction monitoring and processing
├── web-service/        # Web interface and API endpoints
├── demo-wallet/        # Demo wallet for testing
└── package.json        # Root package.json for managing all services
```

## Services

### Backend Engine

The backend engine is responsible for:
- Monitoring Sui transactions
- Processing swaps, bridges, and offramps
- Managing refunds
- Interfacing with external services

Key features:
- Bridge support (Sui, Sol)
- Transaction monitoring
- Automatic refund handling
- Offramp integration with Paystack by Stripe

Environment Variables:
- `PORT`: Server port (default: 3001)
- `MAX_RETRIES`: Maximum retry attempts (default: 3)
- `RETRY_DELAY_MS`: Retry delay in milliseconds (default: 1000)
- `SUI_NETWORK`: Sui network (testnet/mainnet)
- `SUI_RPC_URL`: Sui RPC endpoint
- `WALLET_ADDRESS`: Sui wallet address for monitoring
- `SUI_SECRET_KEY`: Sui wallet private key
- `SUI_MNEMONIC`: Sui wallet mnemonic
- `SOL_PRIVATE_KEY`: Solana wallet private key
- `ETH_PRIVATE_KEY`: Ethereum wallet private key
- `BRIDGED_SUI_TOKEN_MINT`: Bridged SUI token address
- `BRIDGED_SUI_TOKEN_DECIMALS`: Token decimals
- `WEB_SERVICE_URL`: Web service URL
- `SERVICE_TOKEN`: Service authentication token
- `PAYSTACK_SECRET_KEY`: Paystack API key
- `PAYSTACK_BASE_URL`: Paystack API URL

### Web Service

The web service provides:
- User interface for managing swap and bridge preferences
- API endpoints for the backend engine
- User authentication and profile management
- Bank details management

Key features:
- Next.js frontend
- MongoDB database
- JWT authentication
- Paystack integration

Environment Variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing key
- `SERVICE_TOKEN`: Service authentication token
- `PAYSTACK_SECRET_KEY`: Paystack API key
- `ASAP_DOMAIN`: ASAP domain address

### Demo Wallet

A demonstration wallet that supports:
- Creating and managing wallets
- Sending and receiving tokens
- Viewing token balances

Key features:
- React + Vite
- Sui wallet integration
- Token balance tracking
- Network switching

Environment Variables:
- `VITE_ASAP_DOMAIN`: ASAP domain address

## Development

### Running Individual Services

```bash
# Backend Engine
cd backend-engine
npm run dev

# Web Service
cd web-service
npm run dev

# Demo Wallet
cd demo-wallet
npm run dev
```

### Building for Production

```bash
npm run build
```
