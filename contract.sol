// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9; 

contract MooDengEmojiMatchingCardGame {
    struct Player {
        address addr;
        uint256 score;
    }

    // Initialize player, cards & deck
    Player public player;
    string[16] public deck;
    uint8 public totalCards = 16;

    // Maintain card state
    bool[16] public matchedCards;
    uint256 public cardsPicked;
    uint8[2] public pickedCards;

    event CardPicked(address player, uint8 cardIndex);
    event MatchFound(address player, uint8 card1, uint8 card2);

    constructor(address playerAddress) {
        player = Player(playerAddress, 0);
        initializeDeck();
        shuffleDeck();
    }

    function initializeDeck() internal {
        string[8] memory emojis = [
            unicode"😀", unicode"😂", unicode"😍", unicode"😎",
            unicode"😜", unicode"🦛", unicode"😱", unicode"🤓"
        ];

        // Initialize the deck with pairs of emojis
        for (uint8 i = 0; i < totalCards; i++) {
            deck[i] = emojis[i / 2];
        }
    }

    function shuffleDeck() public {
        for (uint8 i = 0; i < totalCards; i++) {
            uint8 randomIndex = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, i))) % totalCards);
            string memory temp = deck[i];
            deck[i] = deck[randomIndex];
            deck[randomIndex] = temp;
        }

        // Reset matchedCards and pickedCards to start a new game
        for (uint8 i = 0; i < totalCards; i++) {
            matchedCards[i] = false;
        }
        cardsPicked = 0;
    }

    function pickCard(uint8 cardIndex) public {
        // Make sure the cards are not matched or they are not picking > 2 cards
        require(cardIndex < totalCards, "Card not within range.");
        require(!matchedCards[cardIndex], "Card already matched.");
        require(cardsPicked < 2, "Two cards already picked");

        pickedCards[cardsPicked] = cardIndex;
        cardsPicked++;
        emit CardPicked(msg.sender, cardIndex);

        if (cardsPicked == 2) {
            _checkMatch();
        }
    }

    function _checkMatch() internal {
        uint8 card1 = pickedCards[0];
        uint8 card2 = pickedCards[1];

        if (keccak256(abi.encodePacked(deck[card1])) == keccak256(abi.encodePacked(deck[card2]))) {
            // Cards match, score increases
            matchedCards[card1] = true;
            matchedCards[card2] = true;
            player.score++;
            emit MatchFound(player.addr, card1, card2);
        }

        // Reset picks
        cardsPicked = 0;
    }

    function startNewGame() public {
        // No restriction on who can start a new game
        initializeDeck();
        shuffleDeck();
        cardsPicked = 0;
        player.score = 0;
    }

    function getScore() public view returns (uint256) {
        return player.score;
    }

    function getDeck() public view returns (string[16] memory) {
        return deck;
    }
}