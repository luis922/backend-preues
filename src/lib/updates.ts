import { db } from "../db.connection";

export async function updateEssayCompletionTime(time: number, essayId: number) {
  try {
    const essay = await db.essay_to_do.update({
      where: { id: essayId },
      data: {
        totalTime: time,
      },
    });
    console.log(essay);
    return essay;
  } catch (err) {
    console.log("Couldn't update totalTime:" + err);
    return;
  }
}
