import { prisma } from "../db";
import { PROBLEMS } from "./problems";

async function main() {
  for (const p of PROBLEMS) {
    await prisma.problem.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        prompt: p.prompt,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
      },
      update: {
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        prompt: p.prompt,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
      },
    });
  }
  console.log(`Seeded ${PROBLEMS.length} problems.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
