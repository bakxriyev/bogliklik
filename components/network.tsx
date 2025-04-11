"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Info, X } from "lucide-react"
import connectionData from '../data/connection.json'

type Person = {
  id: string
  name: string
  info: string
  gender: "male" | "female"
  details?: {
    birthDate?: string
    birthPlace?: string
    occupation?: string
    education?: string
    hobbies?: string[]
    description?: string
  }
}

type Connection = {
  source: string
  target: string
  relationship: string
}

type ConnectionPath = {
  id: string
  path: string[]
  relationships: string[]
  description: string
  color: string
}

type NetworkData = {
  people: Person[]
  connections: Connection[]
  connectionPaths: ConnectionPath[]
}

type NodePosition = {
  x: number
  y: number
}

type NodePositions = Record<string, NodePosition>

export default function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<NetworkData | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showPeopleList, setShowPeopleList] = useState(false)

  const searchParams = useSearchParams()
  const source = searchParams.get("source") || "Bobur"
  const target = searchParams.get("target") || "Zaxro"

  useEffect(() => {
    if (source && target) {
      setLoading(true)


      setTimeout(() => {

        const sourcePerson = connectionData.people.find((p) => p.name === source)
        const targetPerson = connectionData.people.find((p) => p.name === target)

        if (!sourcePerson || !targetPerson) {

          setData(connectionData as NetworkData)
          setLoading(false)
          return
        }

        const paths = findAllPaths(connectionData.connections, sourcePerson.id, targetPerson.id, connectionData.people)

        if (paths.length === 0) {

          setData(connectionData as NetworkData)
        } else {
          const connectionPaths = paths.map((path, index) => {
            const pathNames = path.nodeIds
              .map((id) => {
                const person = connectionData.people.find((p) => p.id === id)
                return person ? person.name : ""
              })
              .filter((name) => name !== "")

            const relationships = path.relationships

            return {
              id: `path${index + 1}`,
              path: pathNames,
              relationships,
              description: createPathDescription(pathNames, relationships),
              color: getPathColor(index),
            }
          })

          setData({
            people: connectionData.people,
            connections: connectionData.connections,
            connectionPaths,
          })
        }

        setLoading(false)
      }, 1000)
    }
  }, [source, target])

  // Find all paths between two nodes
  function findAllPaths(connections: Connection[], sourceId: string, targetId: string, people: Person[], maxDepth = 4) {
    const paths: { nodeIds: string[]; relationships: string[] }[] = []
    const visited = new Set<string>()

    function dfs(currentId: string, targetId: string, path: string[], relationships: string[], depth: number) {
      // Base case: reached max depth or target
      if (depth > maxDepth) return
      if (currentId === targetId) {
        paths.push({ nodeIds: [...path, currentId], relationships: [...relationships] })
        return
      }

      visited.add(currentId)

      // Find all connections from current node
      const outgoingConnections = connections.filter((c) => c.source === currentId && !visited.has(c.target))
      const incomingConnections = connections.filter((c) => c.target === currentId && !visited.has(c.source))

      // Process outgoing connections
      for (const conn of outgoingConnections) {
        dfs(conn.target, targetId, [...path, currentId], [...relationships, conn.relationship], depth + 1)
      }

      // Process incoming connections (for bidirectional search)
      for (const conn of incomingConnections) {
        // For incoming connections, we need to find the reverse relationship
        const person = people.find((p) => p.id === conn.source)
        const reversedRelationship = getReverseRelationship(conn.relationship, person?.gender || "male")

        dfs(conn.source, targetId, [...path, currentId], [...relationships, reversedRelationship], depth + 1)
      }

      visited.delete(currentId)
    }

    dfs(sourceId, targetId, [], [], 0)
    return paths.slice(0, 12) // Limit to 12 paths
  }

  // Get reverse relationship
  function getReverseRelationship(relationship: string, gender: string): string {
    const reverseMap: Record<string, string> = {
      Otasi: gender === "male" ? "O'g'li" : "Qizi",
      Onasi: gender === "male" ? "O'g'li" : "Qizi",
      Akasi: "Ukasi",
      Ukasi: "Akasi",
      Opasi: "Singlisi",
      Singlisi: "Opasi",
      "Do'sti": "Do'sti",
      "Turmush o'rtog'i": "Turmush o'rtog'i",
      Qizi: "Otasi",
      "O'g'li": "Otasi",
      Sinfdoshi: "Sinfdoshi",
      Kursdoshi: "Kursdoshi",
      Hamkasbi: "Hamkasbi",
      "Qo'shnisi": "Qo'shnisi",
      Ustozi: "Shogirdi",
      Shogirdi: "Ustozi",
      Dugonasi: "Dugonasi",
      Qarindoshi: "Qarindoshi",
      Jiyani: "Tog'asi",
      Amakisi: "Jiyani",
      "Tog'asi": "Jiyani",
      Xolasi: "Jiyani",
      Hamshirasi: "Bemori",
    }

    return reverseMap[relationship] || relationship
  }

  // Create path description
  function createPathDescription(pathNames: string[], relationships: string[]): string {
    let description = ""
    for (let i = 0; i < pathNames.length; i++) {
      if (i === 0) {
        description += pathNames[i]
      } else {
        description += `ning ${relationships[i - 1].toLowerCase()} ${pathNames[i]}`
      }
    }
    return description
  }

  // Get color for path
  function getPathColor(index: number): string {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#d946ef",
      "#ec4899",
      "#f43f5e",
      "#84cc16",
      "#14b8a6",
    ]
    return colors[index % colors.length]
  }

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((prevScale) => Math.max(0.5, Math.min(2, prevScale + delta)))
  }, [])

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [])

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isDragging) {
        setOffset((prev) => ({
          x: prev.x + (e.clientX - dragStart.x) / scale,
          y: prev.y + (e.clientY - dragStart.y) / scale,
        }))
        setDragStart({ x: e.clientX, y: e.clientY })
      } else if (canvasRef.current && data) {
        // Check if hovering over a node
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        const mouseX = (e.clientX - rect.left) / scale - offset.x
        const mouseY = (e.clientY - rect.top) / scale - offset.y

        // Check if mouse is over any node
        const nodePositions = calculateAllNodePositions(data, canvas.width, canvas.height)
        let foundNode = null
        let foundPath = null

        // Check for node hover
        for (const [nodeId, pos] of Object.entries(nodePositions)) {
          const person = data.people.find((p) => p.id === nodeId)
          if (!person) continue

          const nodeSize = 30
          const distance = Math.sqrt(Math.pow(mouseX - pos.x, 2) + Math.pow(mouseY - pos.y, 2))
          if (distance <= nodeSize) {
            foundNode = person.name
            break
          }
        }

        // Check for path hover (if no node is hovered)
        if (!foundNode && data.connectionPaths) {
          for (const path of data.connectionPaths) {
            const pathNodeIds = path.path
              .map((name) => {
                const person = data.people.find((p) => p.name === name)
                return person ? person.id : null
              })
              .filter(Boolean) as string[]

            for (let i = 0; i < pathNodeIds.length - 1; i++) {
              const sourceId = pathNodeIds[i]
              const targetId = pathNodeIds[i + 1]
              const sourcePos = nodePositions[sourceId]
              const targetPos = nodePositions[targetId]

              if (sourcePos && targetPos) {
                // Check if mouse is near the connection line
                const isNearLine = isPointNearLine(
                  mouseX,
                  mouseY,
                  sourcePos.x,
                  sourcePos.y + 40,
                  targetPos.x,
                  targetPos.y - 40,
                  20, // Tolerance
                )

                if (isNearLine) {
                  foundPath = path.id
                  break
                }
              }
            }
            if (foundPath) break
          }
        }

        setHoveredNode(foundNode)
        setHoveredPath(foundPath)
      }
    },
    [isDragging, dragStart, scale, offset, data],
  )

  // Handle mouse up for dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle node click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (canvasRef.current && data && hoveredNode) {
        const person = data.people.find((p) => p.name === hoveredNode)
        if (person) {
          setSelectedPerson(person)
        }
      }
    },
    [data, hoveredNode],
  )

  // Draw the network graph
  useEffect(() => {
    if (!data || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = 700
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    canvas.addEventListener("wheel", handleWheel, { passive: false })

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y)
    ctx.scale(scale, scale)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw the network
    drawFamilyTreeNetwork(ctx, data, canvas.width, canvas.height, hoveredNode, hoveredPath)

    ctx.restore()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [data, scale, offset, handleWheel, hoveredNode, hoveredPath])

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[700px]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>
          {source} va {target} o'rtasidagi aloqalar izlanmoqda...
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">
          Aloqa: {source} → {target}
        </h2>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center justify-center h-9 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setShowPeopleList(!showPeopleList)}
          >
            {showPeopleList ? "Insonlar ro'yxatini yashirish" : "Insonlar ro'yxatini ko'rsatish"}
          </button>
          <button
            className="inline-flex items-center justify-center h-9 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            onClick={() => {
              setScale(1)
              setOffset({ x: 0, y: 0 })
            }}
          >
            Asl o'lcham
          </button>
          <button
            className="inline-flex items-center justify-center h-9 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
            onClick={() => {
              if (canvasRef.current) {
                const link = document.createElement("a")
                link.download = `aloqa-${source}-${target}.png`
                link.href = canvasRef.current.toDataURL("image/png")
                link.click()
              }
            }}
          >
            Rasm sifatida saqlash
          </button>
        </div>
      </div>

      {showPeopleList && data?.people && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md text-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Insonlar ro'yxati:</h3>
            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowPeopleList(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.people.map((person) => (
              <div
                key={person.id}
                className="p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPerson(person)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${person.gender === "male" ? "bg-blue-500" : "bg-pink-500"}`}
                    ></div>
                    <span className="font-medium">{person.name}</span>
                  </div>
                  <button
                    className="text-gray-400 hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPerson(person)
                    }}
                  >
                    <Info size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{person.info}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.connectionPaths && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md text-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
            <p className="font-medium text-gray-700">Aloqa yo'llari ({data.connectionPaths.length}):</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {data.connectionPaths.map((path, index) => (
              <div
                key={path.id}
                className={`p-3 rounded-md border ${hoveredPath === path.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                style={{ borderLeftWidth: "4px", borderLeftColor: path.color }}
                onMouseEnter={() => setHoveredPath(path.id)}
                onMouseLeave={() => setHoveredPath(null)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: path.color }}></div>
                  <span className="font-medium">Yo'l {index + 1}</span>
                </div>
                <p className="text-xs text-gray-600">{path.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          className="w-full h-[700px] cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
        />

        {hoveredNode && (
          <div className="absolute top-4 left-4 bg-white p-2 rounded-md shadow-md border border-gray-200">
            <div className="text-sm font-medium">{hoveredNode}</div>
            <div className="text-xs text-gray-500">{data?.people.find((p) => p.name === hoveredNode)?.info}</div>
            <button
              className="mt-1 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
              onClick={() => {
                const person = data?.people.find((p) => p.name === hoveredNode)
                if (person) setSelectedPerson(person)
              }}
            >
              <Info size={12} /> Batafsil ma'lumot
            </button>
          </div>
        )}

        {hoveredPath && (
          <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md border border-gray-200 max-w-xs">
            <div
              className="text-sm font-medium mb-1"
              style={{ color: data?.connectionPaths.find((p) => p.id === hoveredPath)?.color }}
            >
              Yo'l {data?.connectionPaths.findIndex((p) => p.id === hoveredPath)! + 1}
            </div>
            <div className="text-xs text-gray-700">
              {data?.connectionPaths.find((p) => p.id === hoveredPath)?.description}
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md border border-gray-200">
          <div className="text-xs font-medium mb-1 text-gray-500">Masshtab: {Math.round(scale * 100)}%</div>
          <div className="flex gap-2">
            <button
              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
            >
              -
            </button>
            <button
              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
        <h3 className="text-sm font-medium mb-2">Yo'llar:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {data?.connectionPaths.map((path, index) => (
            <div key={path.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: path.color }}></div>
              <span className="text-xs">Yo'l {index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPerson.name}</h2>
                  <p className="text-gray-500">{selectedPerson.info}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedPerson(null)}>
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Shaxsiy ma'lumotlar</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Jinsi:</span>
                      <span>{selectedPerson.gender === "male" ? "Erkak" : "Ayol"}</span>
                    </div>
                    {selectedPerson.details?.birthDate && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Tug'ilgan sana:</span>
                        <span>{selectedPerson.details.birthDate}</span>
                      </div>
                    )}
                    {selectedPerson.details?.birthPlace && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Tug'ilgan joy:</span>
                        <span>{selectedPerson.details.birthPlace}</span>
                      </div>
                    )}
                    {selectedPerson.details?.occupation && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Kasbi:</span>
                        <span>{selectedPerson.details.occupation}</span>
                      </div>
                    )}
                    {selectedPerson.details?.education && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Ma'lumoti:</span>
                        <span>{selectedPerson.details.education}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Qo'shimcha ma'lumotlar</h3>
                  {selectedPerson.details?.hobbies && selectedPerson.details.hobbies.length > 0 && (
                    <div className="mb-3">
                      <span className="font-medium text-gray-700">Qiziqishlari:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedPerson.details.hobbies.map((hobby, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPerson.details?.description && (
                    <div>
                      <span className="font-medium text-gray-700">Tavsif:</span>
                      <p className="mt-1 text-gray-600">{selectedPerson.details.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Aloqalar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data?.connections
                    .filter((conn) => conn.source === selectedPerson.id || conn.target === selectedPerson.id)
                    .map((connection, index) => {
                      const isSource = connection.source === selectedPerson.id
                      const otherId = isSource ? connection.target : connection.source
                      const otherPerson = data.people.find((p) => p.id === otherId)

                      if (!otherPerson) return null

                      return (
                        <div key={index} className="p-3 rounded-md border border-gray-200 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{otherPerson.name}</span>
                            <span className="text-sm text-blue-600">
                              {isSource
                                ? connection.relationship
                                : getReverseRelationship(connection.relationship, otherPerson.gender)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{otherPerson.info}</p>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => setSelectedPerson(null)}
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Check if a point is near a line
function isPointNearLine(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tolerance: number,
): boolean {
  // Calculate the distance from point to line
  const A = px - x1
  const B = py - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1

  if (lenSq !== 0) param = dot / lenSq

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  const dx = px - xx
  const dy = py - yy
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance < tolerance
}

function calculateAllNodePositions(data: NetworkData, width: number, height: number): NodePositions {
  const nodePositions: NodePositions = {}
  const uniqueNodes = new Set<string>()
  const levelMap: Record<string, number> = {}


  const source = data.connectionPaths[0].path[0]
  const target = data.connectionPaths[0].path[data.connectionPaths[0].path.length - 1]


  data.connectionPaths.forEach((path) => {
    path.path.forEach((nodeName, index) => {
      uniqueNodes.add(nodeName)


      if (nodeName === source) {
        levelMap[nodeName] = 0
      } else if (nodeName === target) {
        levelMap[nodeName] = 4
      } else {

        const pathLength = path.path.length
        const relativeLevel = Math.round((index / (pathLength - 1)) * 4)


        if (levelMap[nodeName] !== undefined) {
          levelMap[nodeName] = Math.round((levelMap[nodeName] + relativeLevel) / 2)
        } else {
          levelMap[nodeName] = relativeLevel
        }
      }
    })
  })


  const levelGroups: Record<number, string[]> = {}
  Object.entries(levelMap).forEach(([nodeName, level]) => {
    if (!levelGroups[level]) {
      levelGroups[level] = []
    }
    levelGroups[level].push(nodeName)
  })

  // Calculate optimal positions for each level
  const maxLevel = Math.max(...Object.keys(levelGroups).map(Number))
  const levelSpacing = height / (maxLevel + 1)

  // Position nodes by level with improved horizontal spacing
  Object.entries(levelGroups).forEach(([levelStr, nodeNames]) => {
    const level = Number.parseInt(levelStr)
    const y = levelSpacing * level + 100 // Add padding from top

    // Calculate horizontal positions with better spacing
    const nodeCount = nodeNames.length
    const levelWidth = width - 200 // Padding from sides
    const spacing = levelWidth / (nodeCount + 1)

    // Sort nodes to minimize crossing lines
    const sortedNodes = sortNodesForLevel(nodeNames, level, data, levelMap)

    sortedNodes.forEach((nodeName, index) => {
      const person = data.people.find((p) => p.name === nodeName)
      if (!person) return

      // Calculate x position with offset to avoid overlapping
      const x = 100 + spacing * (index + 1)

      nodePositions[person.id] = { x, y }
    })
  })

  return nodePositions
}

// Sort nodes within a level to minimize line crossings
function sortNodesForLevel(
  nodeNames: string[],
  level: number,
  data: NetworkData,
  levelMap: Record<string, number>,
): string[] {
  if (level === 0 || level === 4 || nodeNames.length <= 1) {
    return nodeNames
  }

  // For intermediate levels, sort based on connections
  const nodeScores: Record<string, number> = {}

  nodeNames.forEach((nodeName) => {
    let score = 0

    // Find all paths that include this node
    data.connectionPaths.forEach((path) => {
      const nodeIndex = path.path.findIndex((n) => n === nodeName)
      if (nodeIndex !== -1) {
        // If node is in the path, calculate score based on connected nodes
        if (nodeIndex > 0) {
          const prevNode = path.path[nodeIndex - 1]
          if (levelMap[prevNode] < level) {
            // Add to score based on previous node's position
            const prevNodeIndex = nodeNames.indexOf(prevNode)
            if (prevNodeIndex !== -1) {
              score += prevNodeIndex
            }
          }
        }

        if (nodeIndex < path.path.length - 1) {
          const nextNode = path.path[nodeIndex + 1]
          if (levelMap[nextNode] > level) {
            // Add to score based on next node's position
            const nextNodeIndex = nodeNames.indexOf(nextNode)
            if (nextNodeIndex !== -1) {
              score += nextNodeIndex
            }
          }
        }
      }
    })

    nodeScores[nodeName] = score
  })

  // Sort nodes by score
  return [...nodeNames].sort((a, b) => nodeScores[a] - nodeScores[b])
}

// Draw the family tree network with all paths
function drawFamilyTreeNetwork(
  ctx: CanvasRenderingContext2D,
  data: NetworkData,
  width: number,
  height: number,
  hoveredNode: string | null,
  hoveredPath: string | null,
) {
  // Calculate node positions
  const nodePositions = calculateAllNodePositions(data, width, height)

  // First, draw all connections
  data.connectionPaths.forEach((path) => {
    const isHighlighted = hoveredPath === path.id
    drawPathConnections(ctx, data, path, nodePositions, isHighlighted)
  })

  // Then, draw all nodes (so they appear on top of connections)
  const drawnNodes = new Set<string>()

  data.connectionPaths.forEach((path) => {
    path.path.forEach((nodeName) => {
      const person = data.people.find((p) => p.name === nodeName)
      if (!person || drawnNodes.has(person.id)) return

      const pos = nodePositions[person.id]
      if (!pos) return

      const isSource = nodeName === data.connectionPaths[0].path[0]
      const isTarget = nodeName === data.connectionPaths[0].path[data.connectionPaths[0].path.length - 1]
      const isHovered = nodeName === hoveredNode

      drawNode(ctx, person, pos, isSource, isTarget, isHovered)
      drawnNodes.add(person.id)
    })
  })
}

// Draw a single node
function drawNode(
  ctx: CanvasRenderingContext2D,
  person: Person,
  pos: NodePosition,
  isSource: boolean,
  isTarget: boolean,
  isHovered: boolean,
) {
  const nodeSize = isHovered ? 35 : 30

  // Draw shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  // Draw shape based on gender
  if (person.gender === "male") {
    // Draw square for males
    ctx.beginPath()
    ctx.rect(pos.x - nodeSize, pos.y - nodeSize, nodeSize * 2, nodeSize * 2)

    // Fill based on position in path
    if (isSource) {
      ctx.fillStyle = "#3b82f6" // blue for source
    } else if (isTarget) {
      ctx.fillStyle = "#8b5cf6" // purple for target
    } else {
      ctx.fillStyle = "#10b981" // green for intermediate
    }

    ctx.fill()
  } else {
    // Draw circle for females
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2)

    // Fill based on position in path
    if (isSource) {
      ctx.fillStyle = "#3b82f6" // blue for source
    } else if (isTarget) {
      ctx.fillStyle = "#8b5cf6" // purple for target
    } else {
      ctx.fillStyle = "#10b981" // green for intermediate
    }

    ctx.fill()
  }

  // Reset shadow
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Draw border
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = isHovered ? 3 : 2
  ctx.stroke()

  // Draw name below node with background for better readability
  const name = person.name
  ctx.font = isHovered ? "bold 14px Arial" : "bold 12px Arial"
  const textWidth = ctx.measureText(name).width

  // Draw text background
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
  ctx.fillRect(pos.x - textWidth / 2 - 5, pos.y + 40, textWidth + 10, 20)

  // Draw text
  ctx.fillStyle = "#000000"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(name, pos.x, pos.y + 50)

  // Draw additional info if hovered
  if (isHovered) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillRect(pos.x - 80, pos.y + 65, 160, 20)

    ctx.fillStyle = "#4b5563"
    ctx.font = "11px Arial"
    ctx.fillText(person.info, pos.x, pos.y + 75)
  }

  // Draw "info" button if hovered
  if (isHovered) {
    ctx.beginPath()
    ctx.arc(pos.x + nodeSize - 5, pos.y - nodeSize + 5, 8, 0, Math.PI * 2)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = "#3b82f6"
    ctx.font = "bold 10px Arial"
    ctx.fillText("i", pos.x + nodeSize - 5, pos.y - nodeSize + 5)
  }
}

// Draw connections for a single path
function drawPathConnections(
  ctx: CanvasRenderingContext2D,
  data: NetworkData,
  path: ConnectionPath,
  nodePositions: NodePositions,
  isHighlighted: boolean,
) {
  const pathNodeIds: string[] = []

  // Map names to IDs
  path.path.forEach((name) => {
    const person = data.people.find((p) => p.name === name)
    if (person) {
      pathNodeIds.push(person.id)
    }
  })

  // Draw connections between nodes
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const sourceId = pathNodeIds[i]
    const targetId = pathNodeIds[i + 1]
    const sourcePos = nodePositions[sourceId]
    const targetPos = nodePositions[targetId]

    if (sourcePos && targetPos) {
      // Draw straight lines instead of curves
      ctx.beginPath()

      // For horizontal connections (nodes on same level)
      if (Math.abs(sourcePos.y - targetPos.y) < 10) {
        // Draw horizontal line
        ctx.moveTo(sourcePos.x + 30, sourcePos.y) // Right of source node
        ctx.lineTo(targetPos.x - 30, targetPos.y) // Left of target node
      }

      else {
        // Calculate midpoint for vertical line
        const midY = (sourcePos.y + targetPos.y) / 2

        // Draw line from source down to midpoint
        ctx.moveTo(sourcePos.x, sourcePos.y + 30) // Bottom of source node
        ctx.lineTo(sourcePos.x, midY)

        // Draw horizontal line at midpoint
        ctx.lineTo(targetPos.x, midY)


        ctx.lineTo(targetPos.x, targetPos.y - 30) // Top of target node
      }

      ctx.strokeStyle = path.color
      ctx.lineWidth = isHighlighted ? 3 : 2
      ctx.stroke()


      if (isHighlighted) {
        const relationship = path.relationships[i]
        let labelX, labelY


        if (Math.abs(sourcePos.y - targetPos.y) < 10) {

          labelX = (sourcePos.x + targetPos.x) / 2
          labelY = sourcePos.y - 15
        } else {

          labelX = (sourcePos.x + targetPos.x) / 2
          labelY = (sourcePos.y + targetPos.y) / 2
        }

        const textWidth = ctx.measureText(relationship).width

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.fillRect(labelX - textWidth / 2 - 5, labelY - 10, textWidth + 10, 20)


        ctx.strokeStyle = path.color
        ctx.lineWidth = 1
        ctx.strokeRect(labelX - textWidth / 2 - 5, labelY - 10, textWidth + 10, 20)

        ctx.fillStyle = "#000000"
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(relationship, labelX, labelY)
      }
    }
  }
}
