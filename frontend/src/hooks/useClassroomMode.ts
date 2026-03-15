import { useMemo } from "react";

export interface ClassroomConfig {
  isClassroom: boolean;
  lessonTopic: string | null;
  classroomUrl: string;
}

const VALID_TOPICS = ["physics", "art", "music", "animals", "space"] as const;
export type LessonTopic = (typeof VALID_TOPICS)[number];

export function isValidTopic(topic: string): topic is LessonTopic {
  return VALID_TOPICS.includes(topic as LessonTopic);
}

export function useClassroomMode(): ClassroomConfig {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const lesson = params.get("lesson");

    const isClassroom = mode === "class";
    const lessonTopic =
      isClassroom && lesson && isValidTopic(lesson) ? lesson : null;

    const classroomUrl = `${window.location.origin}${window.location.pathname}?mode=class${lessonTopic ? `&lesson=${lessonTopic}` : ""}`;

    return { isClassroom, lessonTopic, classroomUrl };
  }, []);
}
