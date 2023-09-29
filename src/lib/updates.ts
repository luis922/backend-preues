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

export async function updateEssayScore(
  essayId: number,
  correctAnswers: number
) {
  try {
    const essay = await db.essay_to_do.update({
      where: { id: essayId },
      data: {
        score: correctAnswers * 10,
      },
    });
    return;
  } catch (err) {
    console.log("Couldn't update score:" + err);
    return;
  }
}

export async function updateUserCoins(userId: number, correctAnswers: number) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        coins: correctAnswers,
      },
    });
    return;
  } catch (err) {
    console.log("Couldn't update score:" + err);
    return;
  }
}
