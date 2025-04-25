
import React from 'react';
import { cn } from '@/lib/utils';

export type Step = {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  current: boolean;
}

type StepperProps = {
  steps: Step[];
  onStepClick?: (step: string) => void;
}

const Stepper = ({ steps, onStepClick }: StepperProps) => {
  return (
    <nav aria-label="Progress" className="py-6">
      <ol role="list" className="flex items-center justify-center gap-4 md:gap-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn("relative", { "flex-1": steps.length <= 5 })}>
            {stepIdx !== steps.length - 1 && (
              <div className="absolute left-0 right-0 top-4 -translate-y-1/2 flex items-center" aria-hidden="true">
                <div className={cn(
                  "h-0.5 w-full", 
                  step.completed ? "bg-ml-primary" : "bg-gray-200"
                )} />
              </div>
            )}
            
            <button
              type="button"
              onClick={() => step.completed && onStepClick?.(step.id)}
              className={cn(
                "relative flex flex-col items-center group",
                step.completed ? "cursor-pointer" : "",
                !step.completed && !step.current ? "cursor-not-allowed" : ""
              )}
              disabled={!step.completed && !step.current}
            >
              <span className="flex items-center justify-center">
                <span
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm",
                    step.completed ? "bg-ml-primary text-white" : 
                    step.current ? "border-2 border-ml-primary text-ml-primary" : 
                    "bg-gray-200 text-gray-500"
                  )}
                  aria-hidden="true"
                >
                  {step.completed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepIdx + 1
                  )}
                </span>
              </span>
              <span className="mt-2 text-xs font-medium text-center">
                {step.name}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
