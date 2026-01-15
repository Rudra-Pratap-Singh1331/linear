"use client";

import React, { useState } from "react";
import WelcomeStep from "@/component/onboarding/WelcomeStep";
import ThemeStep from "@/component/onboarding/ThemeStep";
import CommandMenuStep from "@/component/onboarding/CommandMenuStep";
import GitHubStep from "@/component/onboarding/GitHubStep";
import InviteStep from "@/component/onboarding/InviteStep";
import SubscribeStep from "@/component/onboarding/SubscribeStep";
import FinalStep from "@/component/onboarding/FinalStep";

// Steps enum
const STEPS = {
  WELCOME: 1,
  THEME: 2,
  COMMAND_MENU: 3,
  GITHUB: 4,
  INVITE: 5,
  SUBSCRIBE: 6,
  FINAL: 7,
};

export default function WelcomePage() {

  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [maxVisitedStep, setMaxVisitedStep] = useState(STEPS.WELCOME);
  const [completed, setCompleted] = useState(false);

  const nextStep = () => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next > maxVisitedStep) {
        setMaxVisitedStep(next);
      }
      return next;
    });
  };

  const handleDotClick = (stepNum) => {
    // Only allow navigating to previous steps
    if (stepNum < currentStep) {
      setCurrentStep(stepNum);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return <WelcomeStep onNext={nextStep} />;
      case STEPS.THEME:
        return <ThemeStep onNext={nextStep} />;
      case STEPS.COMMAND_MENU:
        return <CommandMenuStep onNext={nextStep} />;
      case STEPS.GITHUB:
        return <GitHubStep onNext={nextStep} />;
      // Temporary placeholders until we implement the rest
      case STEPS.INVITE:
        return <InviteStep onNext={nextStep} />;
      case STEPS.SUBSCRIBE:
        return <SubscribeStep onNext={nextStep} />;
      case STEPS.FINAL:
        return <FinalStep />;
      default:
        return <WelcomeStep onNext={nextStep} />;
    }
  };

  return (
    <>
      {renderStep()}
      
      {/* Pagination Dots (Optional, based on screenshot) */}
      <div className="fixed bottom-[34px] flex gap-[20px] z-50">
        {Object.keys(STEPS).map((key) => {
           // Provide a visual indicator of progress
           const stepNum = STEPS[key];
           const isActive = stepNum === currentStep;
           const isPrevious = stepNum < currentStep;
           
           return (
             <div
               key={key}
               onClick={() => handleDotClick(stepNum)}
               className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                 isActive 
                   ? "bg-[#8d8d8d] dark:bg-[#565656]" 
                   : "bg-[#cecece] dark:bg-[#212427]"
               } ${isPrevious ? "cursor-pointer hover:bg-[#a0a0a0] dark:hover:bg-[#404040]" : "cursor-default"}`}
             />
           );
        })}
      </div>
    </>
  );
}
