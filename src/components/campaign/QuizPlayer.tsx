"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { QuizActivity } from "@/types/corise";

export function QuizPlayer({
  quiz,
  onComplete,
  nextStepLabel,
}: {
  quiz: QuizActivity;
  onComplete: () => void;
  nextStepLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  const question = quiz.questions[index];

  if (done) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm" role="status">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <Icon name="check" size={18} />
        </span>
        <h3 className="mt-3 text-lg font-semibold">Quiz complete</h3>
        <p className="mt-1 text-[15px] text-[var(--color-text-muted)]">{quiz.completionMessage}</p>
        <p className="mt-3 text-sm font-semibold text-[var(--color-primary)]">
          You answered {score} of {quiz.questions.length} correctly.
        </p>
        {nextStepLabel ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{nextStepLabel}</p> : null}
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{quiz.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {index + 1} / {quiz.questions.length}
        </p>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all"
          style={{ width: `${(index / quiz.questions.length) * 100}%` }}
        />
      </div>
      <h3 className="mt-4 text-[17px] font-semibold">{question.prompt}</h3>
      <div className="mt-3 space-y-2">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={locked}
            onClick={() => {
              setSelected(i);
              setFeedback(null);
            }}
            className={`block w-full rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
              selected === i
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                : "border-black/10 hover:border-[var(--color-primary)]/40"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback ? (
        <p
          className={`mt-3 text-sm font-medium ${feedback.correct ? "text-[var(--color-success)]" : "text-[var(--color-text)]"}`}
          role="status"
        >
          {feedback.text}
        </p>
      ) : null}
      <Button
        className="mt-4"
        disabled={selected === null || locked}
        onClick={() => {
          if (selected === null || locked) return;
          const correct = selected === question.correctIndex;
          setLocked(true);
          setScore((s) => s + (correct ? 1 : 0));
          setFeedback({
            correct,
            text: correct ? "Correct — nice work." : `Not quite. A strong answer is: ${question.options[question.correctIndex]}`,
          });
          setTimeout(() => {
            setLocked(false);
            if (index + 1 >= quiz.questions.length) {
              setDone(true);
              onComplete();
            } else {
              setIndex(index + 1);
              setSelected(null);
              setFeedback(null);
            }
          }, 800);
        }}
      >
        {index + 1 >= quiz.questions.length ? "Finish quiz" : "Next question"}
      </Button>
    </div>
  );
}
