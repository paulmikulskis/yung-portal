import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rootSignups: Prisma.AllowedSignupsCreateManyInput[] = [
  {
    firstName: "Paul",
    lastName: "Mikulskis",
    email: "mikulskisp@gmail.com",
    accountType: "Platform",
    accountState: {},
  },
  {
    firstName: "Parth",
    lastName: "Nagraj",
    email: "parth.d.nagraj@gmail.com",
    accountType: "Platform",
    accountState: {},
  },
  {
    firstName: "Parth",
    lastName: "Nagraj",
    email: "parth@yungsten.tech",
    accountType: "Platform",
    accountState: {},
  },
];
prisma.allowedSignups.createMany;
/**
 * For each coffee name, create a Coffee record in the DB
 */
function seedCoffee() {
  Promise.all(
    rootSignups.map((signup) =>
      prisma.allowedSignups.upsert({
        where: { email: signup.email },
        update: {
          firstName: signup.firstName,
          lastName: signup.lastName,
          accountType: signup.accountType,
          accountState: signup.accountState,
        },
        create: {
          firstName: signup.firstName,
          lastName: signup.lastName,
          email: signup.email,
          accountType: signup.accountType,
          accountState: signup.accountState,
        },
      })
    )
  )
    .then(() => console.info("[SEED] Succussfully create root dbUser records"))
    .catch((e) =>
      console.error("[SEED] Failed to create root dbUser records", e)
    );
}

seedCoffee();
