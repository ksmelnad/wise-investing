import { auth } from "@/auth";
import CreateDefaultWatchlistBtn from "@/components/dashboard/createDefaultWatchlistBtn";
import Watchlist from "@/components/watchlist";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createDefaultWatchlists, getStocks } from "../actions/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DashboardPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const existingWatchlist = await prisma.watchlist.findFirst({
    where: {
      user: {
        email: session.user.email,
      },
    },
  });

  if (!existingWatchlist) {
    const result = await createDefaultWatchlists();
  }

  const { portfolioStocks, generalStocks } = await getStocks();

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-10">Welcome {session.user.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-5xl font-bold">{portfolioStocks.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>General Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-5xl font-bold">{generalStocks.length}</h2>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
