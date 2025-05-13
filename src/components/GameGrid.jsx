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
    return {
      width: calculatedWidth,
      height: calculatedHeight,
    };
  };

  // Draw the game grid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d')
    const { width, height } = calculateCanvasSize();

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw dots
    ctx.fillStyle = '#000'
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * dotSpacing + boxPadding
        const y = row * dotSpacing + boxPadding
        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw lines
    Object.entries(lines).forEach(([lineId, line]) => {
      if (!line.drawn) {
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
    })

    // Draw boxes with numbers
    Object.entries(boxes).forEach(([boxId, box]) => {
      if (!box.owner) {
        return;
      }

      const [row, col] = boxId.split('-').map(Number)
      const x = col * dotSpacing + boxPadding + dotRadius
      const y = row * dotSpacing + boxPadding + dotRadius
      const size = dotSpacing - dotRadius * 2

      // Draw filled box
      ctx.fillStyle = `${playerColors[box.owner]}30` // Add opacity
      ctx.fillRect(x, y, size, size)

      // Draw box border
      ctx.strokeStyle = playerColors[box.owner]
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, size, size)

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
    }

    for (let i = 0; i < players.length; i++) {
      players[i].score = 0
      Object.keys(boxes).forEach(key => {
        if (players[i].user.id == boxes[key].owner) {
          players[i].score = players[i].score + 1
        }
      })
    }
  }, [gridSize, lines, boxes, players, playerColors, isDragging, dragStart, dragEnd, hoverDot, userId, dotSpacing, boxPadding, calculateCanvasSize])

  // Get dot coordinates from mouse position
  const getDotFromCoords = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    // Find the nearest dot
    let nearestDot = null;
    let minDistance = Infinity;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const dotX = col * dotSpacing + boxPadding;
        const dotY = row * dotSpacing + boxPadding;
        const distance = Math.sqrt((canvasX - dotX) ** 2 + (canvasY - dotY) ** 2);

        if (distance < minDistance && distance < dotSpacing / 2) {
          minDistance = distance;
          nearestDot = [row, col];
        }
      }
    }
    return nearestDot;
  };

  // Check if two dots are adjacent
  const isAdjacent = (dot1, dot2) => {
    const [row1, col1] = dot1
    const [row2, col2] = dot2
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) || // Vertical
      (Math.abs(col1 - col2) === 1 && row1 === row2)    // Horizontal
    );
  }

  // Handle mouse down (start drag)
  const handleMouseDown = (e) => {
    if (currentPlayerId !== userId) {
      return;
    }

    const dot = getDotFromCoords(e.clientX, e.clientY)
    if (dot) {
      setIsDragging(true)
      setDragStart(dot)
      setHoverDot(dot)
    }
  }

  // Handle mouse move (during drag)
  const handleMouseMove = (e) => {
    if (!isDragging || currentPlayerId !== userId) {
      const dot = getDotFromCoords(e.clientX, e.clientY)
      setHoverDot(dot)
      return
    }

    const dot = getDotFromCoords(e.clientX, e.clientY)
    if (dot && isAdjacent(dragStart, dot)) {
      setDragEnd(dot)
    } else {
      setDragEnd(null)
    }
  }

  // Handle mouse up (end drag)
  const handleMouseUp = (e) => {
    if (!isDragging || currentPlayerId !== userId) {
      return;
    }

    const dot = getDotFromCoords(e.clientX, e.clientY)
    if (dot && isAdjacent(dragStart, dot)) {
      // Create line ID (sorted to ensure consistent format)
      const dot1 = `${dragStart[0]}-${dragStart[1]}`
      const dot2 = `${dot[0]}-${dot[1]}`
      const lineId = [dot1, dot2].sort().join('_')

      // Check if line already exists
      if (!lines[lineId]?.drawn) {
        onLineClick(lineId)
      }
    }

    // Reset drag state
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
    setHoverDot(null)
  }

  // Handle touch events
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleMouseDown(e.touches[0])
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      handleMouseMove(e.touches[0])
    }
  }

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
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