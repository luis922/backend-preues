import { db } from "../db.connection";

export async function updateEssayCompletionTime(time: number, essayId: number) {
  try {
    const essay = await db.essay_to_do.update({
      where: { id: essayId },
      data: {
        totalTime: time,
      },
    });

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
    const userInfo = await db.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (userInfo != null) {
      const user = await db.user.update({
        where: { id: userId },
        data: {
          coins: userInfo.coins + correctAnswers,
        },
      });
      return;
    }
    console.log("User info is null");
  } catch (err) {
    console.log("Couldn't update score:" + err);
    return;
  }
}
