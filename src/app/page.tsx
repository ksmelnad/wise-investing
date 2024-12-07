import Features from "@/components/features";
import Watchlist from "@/components/watchlist";
import Hero from "@/components/hero";
import HowItWorks from "@/components/howItWorks";
import MarketNews from "@/components/marketNews";
import Navbar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
    </div>
  );
}
