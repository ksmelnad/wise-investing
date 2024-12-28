import { auth } from "@/auth";
import Account from "@/components/dashboard/account";
import prisma from "@/lib/prisma";

const page = async () => {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findFirst({
    where: {
      email: session.user.email,
    },
  });
  return (
    <div>
      <Account user={user!} />
    </div>
  );
};

export default page;
