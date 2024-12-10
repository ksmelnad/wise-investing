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
      <h2 className="text-2xl font-bold">Welcome {session.user.name}</h2>
    </div>
  );
};

export default DashboardPage;
