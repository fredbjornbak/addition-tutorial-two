
import { useState, useEffect } from 'react';

export const useBlockCounts = (resetTrigger: number) => {
  // First addend blocks
  const [firstNumberTens, setFirstNumberTens] = useState(0);
  const [firstNumberOnes, setFirstNumberOnes] = useState(0);
  
  // Second addend blocks
  const [secondNumberTens, setSecondNumberTens] = useState(0);
  const [secondNumberOnes, setSecondNumberOnes] = useState(0);
  
  // Total blocks
  const [totalTens, setTotalTens] = useState(0);
  const [totalOnes, setTotalOnes] = useState(0);

  // Reset all counts when resetTrigger changes
  useEffect(() => {
    console.log('🔄 useBlockCounts: Resetting all counts due to resetTrigger:', resetTrigger);
    setFirstNumberTens(0);
    setFirstNumberOnes(0);
    setSecondNumberTens(0);
    setSecondNumberOnes(0);
    setTotalTens(0);
    setTotalOnes(0);
  }, [resetTrigger]);

  const handleFirstNumberChange = (tens: number, ones: number) => {
    setFirstNumberTens(tens);
    setFirstNumberOnes(ones);
  };

  const handleSecondNumberChange = (tens: number, ones: number) => {
    setSecondNumberTens(tens);
    setSecondNumberOnes(ones);
  };

  const handleTotalChange = (tens: number, ones: number) => {
    setTotalTens(tens);
    setTotalOnes(ones);
  };

  const resetAllCounts = () => {
    console.log('🔄 useBlockCounts: Manual reset of all counts');
    setFirstNumberTens(0);
    setFirstNumberOnes(0);
    setSecondNumberTens(0);
    setSecondNumberOnes(0);
    setTotalTens(0);
    setTotalOnes(0);
  };

  return {
    firstNumberTens,
    firstNumberOnes,
    secondNumberTens,
    secondNumberOnes,
    totalTens,
    totalOnes,
    handleFirstNumberChange,
    handleSecondNumberChange,
    handleTotalChange,
    resetAllCounts
  };
};
