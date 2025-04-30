"use client"

import { useState } from "react"
import { cn } from "../../shared/lib/utils"

interface QuestionCardProps {
  question: string
  options: string[]
  showResult: boolean
  correctAnswerIdx: number
  remainingTime: number
  timeLimit?: number
}

export function RPGQuestionCard({
  question = "What will you do with the ancient artifact?",
  options = [
    "I'll return it to the temple where it belongs.",
    "I'll sell it to the highest bidder.",
    "I'll keep it for myself, its power could be useful.",
    "I need more information before deciding.",
  ],
  showResult = false,
  correctAnswerIdx = 0,
  remainingTime = 10,
  timeLimit = 10,
}: QuestionCardProps) {
  const [selectedOption] = useState<number | null>(null)

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg bg-black bg-opacity-80 text-slate-200" style={{fontFamily: "VT323, monospace",}}>
      {/* Question */}
      <div className="mb-6 text-center">
        <h3
          className="text-3xl text-center font-bold text-amber-100 mb-6 font-serif">
            {question}
          </h3>
        <div className="h-0.5 bg-gradient-to-r from-amber-900/0 via-amber-700/50 to-amber-900/0" />
      </div>
      {/* Timer */}
      <div className="flex justify-center items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-linear",
                remainingTime <= 3 ? "bg-red-500" : "bg-amber-500",
              )}
              style={{ width: `${(remainingTime / timeLimit) * 100}%` }}
            />
          </div>
          <span className={cn("font-mono text-xl", remainingTime <= 3 ? "text-red-500" : "text-amber-500")}>
            {Math.max(0, Math.floor(remainingTime))}s
          </span>
        </div>
      </div>


      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            disabled={selectedOption !== null || showResult}
            className={cn(
              "w-full text-xl text-left p-3 pl-4 border border-slate-700 rounded-md transition-all duration-200",
              "hover:border-amber-600/70 hover:bg-slate-800/80 hover:shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:translate-x-1",
              "focus:outline-none focus:ring-1 font-bold focus:ring-amber-600/50",
              "relative overflow-hidden group",
              (selectedOption === index || (showResult && correctAnswerIdx === index)) &&
              "border-amber-500 bg-slate-900 shadow-[0_0_12px_rgba(245,158,11,0.3)] translate-x-2",
              showResult && correctAnswerIdx !== index && "opacity-50",
              showResult &&
              selectedOption === index &&
              correctAnswerIdx !== index &&
              "border-red-500 shadow-[0_0_12px_rgba(220,38,38,0.3)]",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "text-slate-200 text-2xl",
                  (selectedOption === index || (showResult && correctAnswerIdx === index)) &&
                  "text-amber-200 font-medium",
                  showResult && selectedOption === index && correctAnswerIdx !== index && "text-red-200",
                )}
              >
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
