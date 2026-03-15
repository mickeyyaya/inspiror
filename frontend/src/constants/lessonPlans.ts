import type { LessonTopic } from "../hooks/useClassroomMode";

export interface LessonPlan {
  id: string;
  emoji: string;
  titleKey: string;
  descKey: string;
  ageRange: string;
  topic: LessonTopic;
  initialPrompt: string;
}

export const LESSON_PLANS: LessonPlan[] = [
  {
    id: "gravity-bounce",
    emoji: "🏀",
    titleKey: "lesson_gravity_title",
    descKey: "lesson_gravity_desc",
    ageRange: "8-10",
    topic: "physics",
    initialPrompt:
      "Make a ball that falls down with gravity and bounces when it hits the ground. I want to see it bounce!",
  },
  {
    id: "quiz-game",
    emoji: "🧠",
    titleKey: "lesson_quiz_title",
    descKey: "lesson_quiz_desc",
    ageRange: "9-12",
    topic: "art",
    initialPrompt:
      "Make a quiz game with 3 questions. Show a question and 2 answer buttons. Turn them green if correct, red if wrong!",
  },
  {
    id: "music-maker",
    emoji: "🎹",
    titleKey: "lesson_music_title",
    descKey: "lesson_music_desc",
    ageRange: "8-11",
    topic: "music",
    initialPrompt:
      "Make a piano with 5 colorful keys. Each key plays a different note when I tap it!",
  },
  {
    id: "pet-simulator",
    emoji: "🐱",
    titleKey: "lesson_pet_title",
    descKey: "lesson_pet_desc",
    ageRange: "8-10",
    topic: "animals",
    initialPrompt:
      "Make a virtual pet cat. I can tap to feed it and it grows bigger. Show a happiness meter!",
  },
  {
    id: "rocket-launch",
    emoji: "🚀",
    titleKey: "lesson_rocket_title",
    descKey: "lesson_rocket_desc",
    ageRange: "10-14",
    topic: "space",
    initialPrompt:
      "Make a rocket that I can launch by tapping. It should fly up with fire particles and dodge asteroids falling down!",
  },
  {
    id: "story-chooser",
    emoji: "📖",
    titleKey: "lesson_story_title",
    descKey: "lesson_story_desc",
    ageRange: "8-12",
    topic: "art",
    initialPrompt:
      "Make a choose-your-own-adventure story. Show text and 2 choice buttons. Each choice leads to a different next page!",
  },
];
