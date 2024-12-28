import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  createDefaultWatchlists,
  getStocks,
  getUserWatchlists,
} from "../actions/actions";
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

  // const existingWatchlist = await prisma.watchlist.findFirst({
  //   where: {
  //     user: {
  //       email: session.user.email,
  //     },
  //   },
  // });

  // if (!existingWatchlist) {
  //   const result = await createDefaultWatchlists();
  // }

  const watchlists = await getUserWatchlists();

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-10">Welcome {session.user.name}</h2>
      {watchlists.length !== 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchlists.map((watchlist) => (
            <Card key={watchlist.id}>
              <CardHeader>
                <CardTitle>
                  {watchlist.name.charAt(0).toUpperCase() +
                    watchlist.name.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-5xl font-bold">
                  {watchlist.stocks.length}
                </h2>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-2xl font-bold">
            You have no watchlists. Create one to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
