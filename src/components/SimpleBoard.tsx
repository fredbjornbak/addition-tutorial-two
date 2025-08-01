import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import PlaceValueColumn from './PlaceValueColumn';
import AnswerDisplay from './AnswerDisplay';
import DragFeedback from './DragFeedback';
import { SimpleBoardProps } from '../types/placeValue';
import { generateBundledPositions } from '../utils/blockPositions';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useBlockManagement } from '../hooks/useBlockManagement';
import { useRegrouping } from '../hooks/useRegrouping';
interface ExtendedSimpleBoardProps extends SimpleBoardProps {
  workspaceId?: string;
  externalTensCount?: number;
  externalOnesCount?: number;
  canAddDirectly?: boolean;
}
const SimpleBoard: React.FC<ExtendedSimpleBoardProps> = ({
  onAddTens,
  onAddOnes,
  userAnswer,
  onBlocksChange,
  resetTrigger,
  workspaceId = 'default',
  externalTensCount,
  externalOnesCount,
  canAddDirectly = true
}) => {
  const {
    blocks,
    setBlocks,
    addTenBlock,
    addOneBlock,
    removeBlock,
    isDragging,
    draggedBlocks,
    startDrag,
    cancelDrag,
    completeDrag,
    showRegroupingHint,
    hideRegroupingHint
  } = useBlockManagement(onAddTens, onAddOnes, onBlocksChange, resetTrigger, externalTensCount, externalOnesCount);
  const {
    isGrouping,
    handleRegroup,
    canRegroup,
    canRegroupOnestoTens,
    canRegroupTensToOnes
  } = useRegrouping(blocks, setBlocks, onBlocksChange);
  const {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragEnter,
    handleDragLeave,
    handleDragOver
  } = useDragAndDrop();
  const handleBlockDragStart = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      console.log('🚀 SimpleBoard drag start for block:', blockId, block.type);
      handleDragStart(block, blocks.filter(b => b.type === 'ones').length);

      // Start visual drag feedback immediately
      if (workspaceId === 'first' || workspaceId === 'second') {
        startDrag(block.type);
      }
    }
  };
  const handleDrop = (e: React.DragEvent, targetType: 'tens' | 'ones') => {
    e.preventDefault();
    console.log('🎯 SimpleBoard drop event:', {
      workspaceId,
      targetType
    });

    // Get internal drag data
    const internalDataStr = e.dataTransfer.getData('text/plain');
    let internalData = null;
    if (internalDataStr) {
      try {
        internalData = JSON.parse(internalDataStr);
      } catch (error) {
        internalData = {
          blockId: internalDataStr
        };
      }
    }

    // Get cross-workspace data
    const crossWorkspaceDataStr = e.dataTransfer.getData('application/json');
    let crossWorkspaceData = null;
    if (crossWorkspaceDataStr) {
      try {
        crossWorkspaceData = JSON.parse(crossWorkspaceDataStr);
      } catch (error) {
        console.log('❌ Failed to parse cross-workspace data');
      }
    }

    // Determine if this is internal regrouping
    const isInternalRegrouping = internalData && (!crossWorkspaceData || !crossWorkspaceData.isCrossWorkspace || crossWorkspaceData.sourceWorkspace === workspaceId);
    console.log('🔍 SimpleBoard drop analysis:', {
      isInternalRegrouping,
      hasInternalData: !!internalData,
      hasCrossWorkspaceData: !!crossWorkspaceData,
      sourceWorkspace: crossWorkspaceData?.sourceWorkspace,
      currentWorkspace: workspaceId
    });
    if (isInternalRegrouping && internalData) {
      console.log('🔄 Processing internal regrouping');
      const draggedBlock = blocks.find(b => b.id === internalData.blockId);
      if (!draggedBlock) {
        console.log('❌ No dragged block found for internal regrouping');
        handleDragEnd();
        return;
      }
      console.log('🔄 Internal regrouping:', {
        draggedBlockType: draggedBlock.type,
        targetType,
        blockId: internalData.blockId
      });

      // Only trigger regrouping for cross-type drops within same workspace
      if (draggedBlock.type !== targetType) {
        console.log('✅ Cross-type drop - triggering regrouping');
        handleRegroup(draggedBlock, targetType);
        hideRegroupingHint(); // Hide hint after successful regrouping
      } else {
        console.log('ℹ️ Same-type drop - no regrouping needed');
      }
    } else if (crossWorkspaceData && crossWorkspaceData.isCrossWorkspace) {
      console.log('📦 Cross-workspace drop - letting bubble up to workspace');
      // For cross-workspace drops, let the event bubble up to WorkspaceSection
      // DON'T stop propagation and DON'T call handleDragEnd() here
      return;
    }
    handleDragEnd();
    completeDrag();
  };
  const handleDragCancel = () => {
    handleDragEnd();
    cancelDrag();
  };

  // Cancel drag on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        handleDragCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDragging]);
  const tensCount = blocks.filter(b => b.type === 'tens').length;
  const onesCount = blocks.filter(b => b.type === 'ones').length;
  const tensBlocks = blocks.filter(b => b.type === 'tens');
  const onesBlocks = blocks.filter(b => b.type === 'ones');
  const hasBundle = onesCount >= 10;
  const totalValue = tensCount * 10 + onesCount;
  useEffect(() => {
    if (hasBundle && !isGrouping) {
      const bundledPositions = generateBundledPositions();
      setBlocks(prev => prev.map((block, index) => {
        if (block.type === 'ones') {
          const onesIndex = prev.filter(b => b.type === 'ones').indexOf(block);
          return {
            ...block,
            position: bundledPositions[onesIndex] || block.position
          };
        }
        return block;
      }));
    }
  }, [hasBundle, isGrouping, setBlocks]);
  return <div className="space-y-2">
      {/* Regrouping Hint */}
      {showRegroupingHint}
      
      <div className="grid grid-cols-2 gap-2">
        <PlaceValueColumn type="tens" blocks={tensBlocks} onAddBlock={addTenBlock} onRemoveBlock={removeBlock} onDragStart={handleBlockDragStart} onDrop={handleDrop} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} isDropTarget={dragState.isOver === 'tens'} isGrouping={isGrouping} workspaceId={workspaceId} onStartBulkDrag={startDrag} canRegroupOnestoTens={canRegroupOnestoTens()} canRegroupTensToOnes={canRegroupTensToOnes()} canAddDirectly={false} />
        
        <PlaceValueColumn type="ones" blocks={onesBlocks} hasBundle={hasBundle} onAddBlock={addOneBlock} onRemoveBlock={removeBlock} onDragStart={handleBlockDragStart} onDrop={handleDrop} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} isDropTarget={dragState.isOver === 'ones'} isGrouping={isGrouping} workspaceId={workspaceId} onStartBulkDrag={startDrag} canRegroupOnestoTens={canRegroupOnestoTens()} canRegroupTensToOnes={canRegroupTensToOnes()} canAddDirectly={canAddDirectly} />
      </div>

      <DragFeedback dragState={dragState} onesCount={onesCount} tensCount={tensCount} draggedBlocks={draggedBlocks} />
    </div>;
};
export default SimpleBoard;