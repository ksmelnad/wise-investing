import { auth } from "@/auth";
import Watchlist from "@/components/watchlist";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/api/auth/signin");
  }
  return (
    <div className="">
      <h3 className="text-lg font-bold pb-4">Wise Investing</h3>
      <h2 className="text-2xl font-bold">Welcome {session.user.name}</h2>
      <Watchlist />
    </div>
  );
};

export default DashboardPage;
