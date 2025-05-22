# .ASAP - Do more, with less effort... ASAP

dotASAP is a blockchain service that enables seamless token swaps, bridging across multiple blockchains and offramping to fiat right from your solana wallet - you do not have to leave your send interface to do more. The system consists of three main components:

1. **Backend Engine**: Monitors and processes blockchain transactions
2. **Web Service**: Provides a user interface and API endpoints
3. **Demo Wallet**: A demonstration wallet for testing transactions

## Features

- 🔄 Cross-chain token swaps
- 🌉 Bridge transactions between chains
- 💱 Offramp to fiat currency
- 🔍 Real-time transaction monitoring
- 🔒 Secure wallet integration
- 📱 Responsive web interface

## Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Solana CLI tools
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
   - Add your Solana wallet private key
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
- Monitoring solana transactions
- Processing swaps, bridges, and offramps
- Managing refunds
- Interfacing with external services

Key features:
- Bridge support (Solana, SUI)
- Transaction monitoring
- Automatic refund handling
- Offramp integration with Paystack by Stripe

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


### Demo Wallet

A demonstration wallet that supports so that it can be used to demonstrate memos:
- Creating and managing wallets
- Sending and receiving tokens
- Viewing token balances
- Network switching (Devnet/Mainnet)

Key features:
- React + Vite
- Solana wallet integration
- Token balance tracking
- Network switching

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

## Environment Variables

### Backend Engine (.env)
- `DEV_URL`: Solana devnet RPC URL
- `DEV2_URL`: Backup Solana devnet RPC URL
- `PORT`: Server port (default: 3001)
- `WEB_SERVICE_URL`: Web service URL
- `SERVICE_TOKEN`: Service authentication token
- `SOL_SWAP_WALLET_PRIVATE_KEY`: Solana wallet private key
- `SUI_SECRET_KEY`: SUI wallet private key
- `PAYSTACK_SECRET_KEY`: Paystack API key

### Web Service (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing key
- `SERVICE_TOKEN`: Service authentication token
- `PAYSTACK_SECRET_KEY`: Paystack API key
- `ASAP_DOMAIN`: ASAP domain address

### Demo Wallet (.env for demo only) 
- `VITE_ASAP_DOMAIN`: ASAP domain address

## License

This project is licensed under the MIT License.

## Acknowledgments

- Solana Foundation
- Paystack
- Jupiter exchange
- Wormhole Foundation