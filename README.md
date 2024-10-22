# Moo Deng Matching Game Depolyed on the Linea Sepolia Test Net

## Overview
This is a simple one-player Moo Deng emoji matching game deployed on the Linea Sepolia Test Net. The goal of the game is to match pairs of emojis from a shuffled deck. The user can interact with the smart contract on the blockchain, which keeps track of the game state, such as the player's score and card matches. The app is the building blocks for a matching game and showcases how to interact with Ethereum smart contracts using the Thirdweb SDK.

## Features
- **One-player Game:** Play a matching game by selecting cards and finding pairs.
- **Blockchain Integration:** Uses a smart contract to manage game logic and player state on the blockchain.
- **Deck Shuffling:** The deck is shuffled each time a new game starts.
- **Score Tracking:** Player score is tracked and updated based on matches found.

## Getting Started
The contract that is deployed to Thirdweb is located under `contract.sol` at the root of this project. You can use this code to upload the contract. 

To run the project locally:

1. Clone the repository.
   ```bash
   git clone <repo-url>
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```
3. Go through the [tutorial]() to create a client ID, upload the contract, and grab the contract address

4. Set up environment variables in this app:
   - Create a `.env.local` file based on the `.env.example` file.
   - Add the Thirdweb client ID as `NEXT_PUBLIC_TEMPLATE_CLIENT_ID`.
   - Update the contract configuration in `client.ts`:

     ```typescript
     export const contract = getContract({
       client,
       chain: defineChain(59141),
       address: "your contract address"
     });
     ```

5. Run the development server:
   ```bash
   yarn dev
   ```

6. Open the app in your browser at `http://localhost:3000`.

## Technologies Used
- **Next.js**: Create the UI
- **Thirdweb SDK**: Blockchain integration for interacting with the Ethereum network

## License
This project is licensed under the MIT License.
