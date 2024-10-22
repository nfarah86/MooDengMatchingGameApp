"use client";

import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import MooDengIcon from "@public/moodeng.jpeg";
import { useState, useEffect } from "react";
import { client, contract } from "./client";

export default function Home() {
  const [cards, setCards] = useState<{ emoji: string; matched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);

  // Note: These functions come from the thirdweb api  & the contract handels the logic for the game

  // Pre: Fetch player's score information using useReadContract
  const { data: scoreData, isPending: scoreLoading } = useReadContract({
    contract,
    method: "function getScore() view returns (uint256)",
    params: [],
  });

  useEffect(() => {
    if (scoreData && !scoreLoading) {
      setScore(Number(scoreData));
    }
  }, [scoreData, scoreLoading]);

  // Step 1: we need to fetch the deck from the contract on component mount
  const { data: deckData, isPending: deckLoading, refetch: refetchDeck } = useReadContract({
    contract,
    method: "function getDeck() view returns (string[16])",
    params: [],
  });

  useEffect(() => {
    if (deckData && !deckLoading) {
      const shuffledCards = Array.from(deckData).map((emoji) => ({
        emoji,
        matched: false,
      }));
      setCards(shuffledCards);
    }
  }, [deckData, deckLoading]);

  // Step 2: handle a card click
  const { mutate: sendTransaction } = useSendTransaction();
  const handleCardClick = (index: number) => {
    if (selectedCards.length === 1) {
      const newSelected = [...selectedCards, index];
      setSelectedCards(newSelected);

      if (cards[newSelected[0]].emoji === cards[newSelected[1]].emoji) {
        // Update card state to mark them as matched
        setCards((prevCards) => {
          const updatedCards = [...prevCards];
          updatedCards[newSelected[0]].matched = true;
          updatedCards[newSelected[1]].matched = true;
          return updatedCards;
        });
        setScore((prevScore) => prevScore + 1);
      }

      // Step 3: Send pickCard transaction to the blockchain
      const transaction = prepareContractCall({
        contract,
        method: "function pickCard(uint8 cardIndex)",
        params: [index],
      });
      sendTransaction(transaction);

      // Reset selected cards after checking
      setTimeout(() => setSelectedCards([]), 1000);
    } else {
      setSelectedCards([index]);
    }
  };

  // Step4: handle starting a new game & reset score & cards
  const handleStartNewGame = () => {
    const transaction = prepareContractCall({
      contract,
      method: "function startNewGame()",
      params: [],
    });
    sendTransaction(transaction, {
      onSuccess: async () => {
        setScore(0);
        setSelectedCards([]);

        // Refetch the newly shuffled deck after starting the new game
        await refetchDeck();
        if (deckData) {
          const shuffledCards = Array.from(deckData).map((emoji) => ({
            emoji,
            matched: false,
          }));
          setCards(shuffledCards);
        }
      },
      onError: (error) => {
        console.error("Error starting a new game:", error);
      },
    });
  };

  return (
    // html doesn't change much- just really updated for the cards
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-20">
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Moo Deng Emoji Matching Game",
              url: "https://example.com",
            }}
          />
        </div>

        {/* player score */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold">Player Score: {score}</h3>
        </div>

        {/* new game button */}
        <div className="text-center mb-8">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleStartNewGame}
          >
            Start New Game
          </button>
        </div>

        {/* a simple game board */}
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`card p-4 border rounded ${
                card.matched ? "bg-green-300" : "bg-blue-300"
              }`}
              onClick={() => handleCardClick(index)}
            >
              {selectedCards.includes(index) || card.matched ? card.emoji : "❓"}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <Image
        src={MooDengIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />

      <h1 className="text-2xl font-semibold md:font-bold mb-6 text-zinc-100">
        Moo Deng Emoji Game
      </h1>
    </header>
  );
}
