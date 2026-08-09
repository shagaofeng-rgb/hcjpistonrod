import { topicRotation } from "./catalog";
import type { Topic } from "./types";

export function selectNextTopic(history: Topic[]): Topic | null {
  const recentEight = history.slice(-8);
  const recentTwelve = history.slice(-12);
  for (const topic of topicRotation) {
    const familyCount = recentEight.filter((item) => item.productFamily === topic.productFamily).length;
    const duplicate = recentTwelve.some((item) => item.id === topic.id || item.uniqueAngle === topic.uniqueAngle);
    if (familyCount < 2 && !duplicate) return topic;
  }
  return null;
}
