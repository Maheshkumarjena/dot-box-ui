'use client'
import { platform } from 'os'
import { useEffect, useRef, useState } from 'react'

const GameGrid = ({
  gridSize,
  lines,
  boxes,
  currentPlayerId,
  userId,
  players,
  playerColors,
  onLineClick,
}) => {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [hoverDot, setHoverDot] = useState(null)

  // Constants for drawing
  const dotRadius = 5
  const dotSpacing = 40
  const lineWidth = 2
  const boxPadding = 20

  // Calculate canvas dimensions based on grid size and padding
  const calculateCanvasSize = () => {
    const calculatedWidth = (gridSize - 1) * dotSpacing + boxPadding * 2;
    const calculatedHeight = (gridSize - 1) * dotSpacing + boxPadding * 2;
    console.log('calculateCanvasSize:', { gridSize, dotSpacing, boxPadding, width: calculatedWidth, height: calculatedHeight });
    return {
      width: calculatedWidth,
      height: calculatedHeight,
    };
  };

  // Draw the game grid
  useEffect(() => {
    console.log('useEffect [gridSize, lines, boxes, players, playerColors, isDragging, dragStart, dragEnd, hoverDot, userId, dotSpacing, boxPadding, calculateCanvasSize] triggered');
    const canvas = canvasRef.current
    if (!canvas) {
      console.log('useEffect: canvasRef.current is null, returning');
      return;
    }

    const ctx = canvas.getContext('2d')
    const { width, height } = calculateCanvasSize();

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    // console.log('useEffect: Canvas dimensions set to', { width, height });

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    console.log('useEffect: Canvas cleared');

    // Draw dots
    ctx.fillStyle = '#000'
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * dotSpacing + boxPadding
        const y = row * dotSpacing + boxPadding
        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
        ctx.fill()
        // console.log('useEffect: Dot drawn at', { row, col, x, y });
      }
    }
    console.log('useEffect: Dots drawn');

    // Draw lines
    Object.entries(lines).forEach(([lineId, line]) => {
      if (!line.drawn) {
        // console.log('useEffect: Line', lineId, 'is not drawn');
        return;
      }

      const [dot1, dot2] = lineId.split('_')
      const [row1, col1] = dot1.split('-').map(Number)
      const [row2, col2] = dot2.split('-').map(Number)

      const x1 = col1 * dotSpacing + boxPadding
      const y1 = row1 * dotSpacing + boxPadding
      const x2 = col2 * dotSpacing + boxPadding
      const y2 = row2 * dotSpacing + boxPadding

      ctx.strokeStyle = playerColors[line.playerId] || '#9CA3AF'
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      // console.log('useEffect: Line', lineId, 'drawn by player', line.playerId, 'from', { x1, y1 }, 'to', { x2, y2 });
    })
    console.log('useEffect: Lines drawn');

    // Draw boxes with numbers
    Object.entries(boxes).forEach(([boxId, box]) => {
      if (!box.owner) {
        // console.log('useEffect: Box', boxId, 'has no owner');
        return;
      }

      console.log(box.owner, 'is the owner of box', boxId);
      players.map((e) => { console.log(e.user.id, 'is a player') })
      console.log("boxes", boxes);



      const [row, col] = boxId.split('-').map(Number)
      const x = col * dotSpacing + boxPadding + dotRadius
      const y = row * dotSpacing + boxPadding + dotRadius
      const size = dotSpacing - dotRadius * 2

      // Draw filled box
      ctx.fillStyle = `${playerColors[box.owner]}30` // Add opacity
      ctx.fillRect(x, y, size, size)
      console.log('useEffect: Box', boxId, 'filled with color', playerColors[box.owner]);

      // Draw box border
      ctx.strokeStyle = playerColors[box.owner]
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, size, size)
      console.log('useEffect: Box', boxId, 'border drawn with color', playerColors[box.owner]);

      // Draw box count number
      const playerScore = Object.values(boxes).filter(b => b.owner === box.owner).length
      ctx.fillStyle = playerColors[box.owner]
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        playerScore.toString(),
        x + size / 2,
        y + size / 2
      )
      console.log('useEffect: Score', playerScore, 'drawn in box', boxId);
    })


    // Draw temporary drag line
    if (isDragging && dragStart && dragEnd) {
      const [row1, col1] = dragStart
      const [row2, col2] = dragEnd

      const x1 = col1 * dotSpacing + boxPadding
      const y1 = row1 * dotSpacing + boxPadding
      const x2 = col2 * dotSpacing + boxPadding
      const y2 = row2 * dotSpacing + boxPadding

      ctx.strokeStyle = `${playerColors[userId]}80`
      ctx.lineWidth = lineWidth
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.setLineDash([])
      // console.log('useEffect: Temporary drag line drawn from', dragStart, 'to', dragEnd);
    }

    // Highlight hover dot
    if (hoverDot) {
      const [row, col] = hoverDot
      const x = col * dotSpacing + boxPadding
      const y = row * dotSpacing + boxPadding

      ctx.fillStyle = playerColors[userId] || '#3B82F6'
      ctx.beginPath()
      ctx.arc(x, y, dotRadius * 1.5, 0, Math.PI * 2)
      ctx.fill()
      // console.log('useEffect: Hover dot highlighted at', hoverDot);
    }

    console.log('players', players)



    for (let i = 0; i < players.length; i++) {

      players[i].score=0
      Object.keys(boxes).forEach(key => {
        console.log(key, 'useEffect: Box is owned by =======================>', boxes[key].owner);
        console.log(players[i].user.id, 'is a player');

        if (players[i].user.id == boxes[key].owner) {
          players[i].score = players[i].score + 1
          console.log(players[i].user.id, 'score updated to', players[i].score);
          console.log(players[0])
          console.log(players[1])
        }
      }
    )
      // players.map((e) => { console.log(e.user.id == boxes[key].owner, 'is a player') })
    }

    // iteration ends here





}, [gridSize, lines, boxes, players, playerColors, isDragging, dragStart, dragEnd, hoverDot, userId, dotSpacing, boxPadding, calculateCanvasSize])

// Get dot coordinates from mouse position
const getDotFromCoords = (x, y) => {
  const canvas = canvasRef.current;
  if (!canvas) {
    console.log('getDotFromCoords: canvasRef.current is null, returning null');
    return null;
  }

  const rect = canvas.getBoundingClientRect();
  const canvasX = x - rect.left;
  const canvasY = y - rect.top;
  // console.log('getDotFromCoords: Mouse coords', { x, y }, 'Canvas rect', rect, 'Canvas coords', { canvasX, canvasY });

  // Find the nearest dot
  let nearestDot = null;
  let minDistance = Infinity;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const dotX = col * dotSpacing + boxPadding;
      const dotY = row * dotSpacing + boxPadding;
      const distance = Math.sqrt((canvasX - dotX) ** 2 + (canvasY - dotY) ** 2);
      // console.log('getDotFromCoords: Checking dot at', { row, col }, 'Coords', { dotX, dotY }, 'Distance', distance);

      if (distance < minDistance && distance < dotSpacing / 2) {
        minDistance = distance;
        nearestDot = [row, col];
        // console.log('getDotFromCoords: Nearest dot updated to', nearestDot, 'with distance', minDistance);
      }
    }
  }
  console.log('getDotFromCoords: Nearest dot found', nearestDot);
  return nearestDot;
};

// Check if two dots are adjacent
const isAdjacent = (dot1, dot2) => {
  const [row1, col1] = dot1
  const [row2, col2] = dot2
  const adjacent = (
    (Math.abs(row1 - row2) === 1 && col1 === col2) || // Vertical
    (Math.abs(col1 - col2) === 1 && row1 === row2)    // Horizontal
  );
  console.log('isAdjacent:', dot1, dot2, 'is adjacent:', adjacent);
  return adjacent;
}

// Handle mouse down (start drag)
const handleMouseDown = (e) => {
  console.log('handleMouseDown: Mouse down event at', { x: e.clientX, y: e.clientY });
  if (currentPlayerId !== userId) {
    console.log('handleMouseDown: Not current player, ignoring');
    return;
  }

  const dot = getDotFromCoords(e.clientX, e.clientY)
  if (dot) {
    setIsDragging(true)
    setDragStart(dot)
    setHoverDot(dot)
    console.log('handleMouseDown: Drag started from dot', dot);
  }
}

// Handle mouse move (during drag)
const handleMouseMove = (e) => {
  const mouseCoords = { x: e.clientX, y: e.clientY };
  // console.log('handleMouseMove: Mouse move event at', mouseCoords);
  if (!isDragging || currentPlayerId !== userId) {
    // Just update hover dot if not dragging
    const dot = getDotFromCoords(e.clientX, e.clientY)
    setHoverDot(dot)
    // console.log('handleMouseMove: Not dragging, hover dot updated to', dot);
    return
  }

  const dot = getDotFromCoords(e.clientX, e.clientY)
  if (dot && isAdjacent(dragStart, dot)) {
    setDragEnd(dot)
    // console.log('handleMouseMove: Drag ended at adjacent dot', dot);
  } else {
    setDragEnd(null)
    // console.log('handleMouseMove: Drag not ended at an adjacent dot');
  }
}

// Handle mouse up (end drag)
const handleMouseUp = (e) => {
  console.log('handleMouseUp: Mouse up event at', { x: e.clientX, y: e.clientY });
  if (!isDragging || currentPlayerId !== userId) {
    console.log('handleMouseUp: Not dragging or not current player, ignoring');
    return;
  }

  const dot = getDotFromCoords(e.clientX, e.clientY)
  if (dot && isAdjacent(dragStart, dot)) {
    // Create line ID (sorted to ensure consistent format)
    const dot1 = `${dragStart[0]}-${dragStart[1]}`
    const dot2 = `${dot[0]}-${dot[1]}`
    const lineId = [dot1, dot2].sort().join('_')
    console.log('handleMouseUp: Potential line drawn between', dragStart, 'and', dot, 'Line ID:', lineId);

    // Check if line already exists
    if (!lines[lineId]?.drawn) {
      console.log('handleMouseUp: Line', lineId, 'is new, calling onLineClick');
      onLineClick(lineId)
    } else {
      console.log('handleMouseUp: Line', lineId, 'already drawn');
    }
  }

  // Reset drag state
  setIsDragging(false)
  setDragStart(null)
  setDragEnd(null)
  setHoverDot(null)
  console.log('handleMouseUp: Dragging state reset');
}

// Handle touch events
const handleTouchStart = (e) => {
  if (e.touches.length === 1) {
    console.log('handleTouchStart: Touch started');
    handleMouseDown(e.touches[0])
  }
}

const handleTouchMove = (e) => {
  if (e.touches.length === 1) {
    // Prevent default touch move behavior to allow scrolling if needed
    e.preventDefault();
    handleMouseMove(e.touches[0])
  }
}

const handleTouchEnd = (e) => {
  if (e.touches.length === 0) {
    console.log('handleTouchEnd: Touch ended');
    handleMouseUp(e.changedTouches[0])
  }
}



return (
  <div className="m-auto flex justify-center" style={{ maxWidth: '500px' }}> {/* Added maxWidth */}
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDragging) {
          setIsDragging(false)
          setDragStart(null)
          setDragEnd(null)
        }
        setHoverDot(null)
        console.log('Canvas: Mouse left, dragging state and hover reset');
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`border border-gray-200 rounded-md ${currentPlayerId === userId ? 'cursor-pointer' : 'cursor-not-allowed'
        } ${currentPlayerId !== userId ? 'pointer-events-none opacity-50' : ''}`}
      style={{
        display: 'block',
      }}
    />
  </div>
)
}

export default GameGrid;