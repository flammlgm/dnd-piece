<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import FooterMap from './components/FooterMap.vue'

// Реактивные переменные
const nodes = ref(new DataSet([]))
const edges = ref(new DataSet([]))
const nodeCounter = ref(1)
const network = ref(null)
const connectionCount = ref(6)
const maxConnectionDistance = ref(400)
const startNode = ref(null)
const endNode = ref(null)
const path = ref([])

const options = {
  nodes: {
    shape: 'dot',
    size: 20,
    borderWidth: 2,
    color: {
      background: '#3b82f6',
      border: '#2563eb',
      highlight: {
        background: '#f59e0b',
        border: '#d97706'
      }
    },
    font: { 
      size: 14,
      color: '#ffffff'
    }
  },
  edges: {
    width: 2,
    color: '#93c5fd',
    smooth: false,
    selectionWidth: 0,
    arrows: { to: false }
  },
  physics: false,
  interaction: {
    dragNodes: true,
    multiselect: false,
    selectConnectedEdges: false
  }
}

// Методы
const addNode = () => {
  const id = nodeCounter.value++
  const x = Math.random() * 800
  const y = Math.random() * 500
  nodes.value.add({ 
    id, 
    label: `${id}`, 
    x, 
    y,
    color: {
      background: '#3b82f6',
      border: '#2563eb'
    }
  })
  updateConnections()
}

const updateConnections = () => {
  if (nodes.value.length < 2) {
    edges.value.clear()
    return
  }

  const nodeList = nodes.value.get()
  const newEdges = []
  const edgeSet = new Set()
  const connectionMap = new Map(nodeList.map(node => [node.id, new Set()]))

  nodeList.forEach(currentNode => {
    const neighbors = []
    
    nodeList.forEach(targetNode => {
      if (currentNode.id === targetNode.id) return
      
      const dist = calculateDistance(currentNode, targetNode)
      if (dist <= maxConnectionDistance.value) {
        neighbors.push({
          id: targetNode.id,
          distance: dist
        })
      }
    })

    neighbors.sort((a, b) => a.distance - b.distance)
    const bestNeighbors = neighbors.slice(0, connectionCount.value)

    bestNeighbors.forEach(neighbor => {
      const edgeId = getEdgeId(currentNode.id, neighbor.id)
      
      if (!edgeSet.has(edgeId)) {
        newEdges.push({
          id: edgeId,
          from: currentNode.id,
          to: neighbor.id,
          label: Math.round(neighbor.distance).toString(),
          length: neighbor.distance,
          width: 2,
          color: '#93c5fd'
        })
        edgeSet.add(edgeId)
        connectionMap.get(currentNode.id).add(neighbor.id)
        connectionMap.get(neighbor.id).add(currentNode.id)
      }
    })
  })

  const finalEdges = newEdges.filter(edge => {
    const fromConnections = connectionMap.get(edge.from)
    const toConnections = connectionMap.get(edge.to)
    return fromConnections.has(edge.to) && toConnections.has(edge.from)
  })

  edges.value.clear()
  edges.value.add(finalEdges)
}

const getEdgeId = (from, to) => {
  return [from, to].sort().join('-')
}

const calculateDistance = (node1, node2) => {
  const dx = node1.x - node2.x
  const dy = node1.y - node2.y
  return Math.sqrt(dx * dx + dy * dy)
}

const handleNodeClick = (params) => {
  if (params.nodes.length === 1) {
    const nodeId = params.nodes[0]
    if (!startNode.value) {
      startNode.value = nodeId
      nodes.value.update({ 
        id: nodeId,
        color: {
          background: '#10B981',
          border: '#059669'
        }
      })
    } else if (!endNode.value && nodeId !== startNode.value) {
      endNode.value = nodeId
      nodes.value.update({ 
        id: nodeId,
        color: {
          background: '#EF4444',
          border: '#DC2626'
        }
      })
      findShortestPath()
    }
  }
}

const findShortestPath = () => {
  if (!startNode.value || !endNode.value) return

  const nodeList = nodes.value.get()
  const edgeList = edges.value.get()
  const distances = {}
  const previous = {}
  const unvisited = new Set()

  nodeList.forEach(node => {
    distances[node.id] = node.id === startNode.value ? 0 : Infinity
    previous[node.id] = null
    unvisited.add(node.id)
  })

  while (unvisited.size > 0) {
    let current = null
    let minDistance = Infinity
    
    unvisited.forEach(nodeId => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId]
        current = nodeId
      }
    })

    if (current === null || current === endNode.value) break
    unvisited.delete(current)

    edgeList.forEach(edge => {
      if (edge.from === current || edge.to === current) {
        const neighbor = edge.from === current ? edge.to : edge.from
        const distance = distances[current] + edge.length
        
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance
          previous[neighbor] = current
        }
      }
    })
  }

  path.value = []
  let current = endNode.value
  while (current !== null) {
    path.value.unshift(current)
    current = previous[current]
  }

  highlightPath()
}

const highlightPath = () => {
  nodes.value.update(nodes.value.get().map(node => ({
    id: node.id,
    color: {
      background: node.id === startNode.value ? '#10B981' : 
                node.id === endNode.value ? '#EF4444' : '#3B82F6',
      border: node.id === startNode.value ? '#059669' :
             node.id === endNode.value ? '#DC2626' : '#2563EB'
    }
  })))

  edges.value.update(edges.value.get().map(edge => ({
    id: edge.id,
    color: '#93C5FD',
    width: 2
  })))

  path.value.forEach(nodeId => {
    nodes.value.update({
      id: nodeId,
      color: {
        background: '#F59E0B',
        border: '#D97706'
      }
    })
  })

  for (let i = 0; i < path.value.length - 1; i++) {
    const from = path.value[i]
    const to = path.value[i+1]
    const edge = edges.value.get().find(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from))
    
    if (edge) {
      edges.value.update({
        id: edge.id,
        color: '#F59E0B',
        width: 4,
        shadow: true
      })
    }
  }
}

const calculatePathLength = () => {
  let length = 0
  for (let i = 0; i < path.value.length - 1; i++) {
    const edge = edges.value.get().find(e => 
      (e.from === path.value[i] && e.to === path.value[i+1]) ||
      (e.to === path.value[i] && e.from === path.value[i+1]))
    if (edge) length += edge.length
  }
  return length
}

const resetSelection = () => {
  nodes.value.update(nodes.value.get().map(node => ({
    id: node.id,
    color: {
      background: '#3B82F6',
      border: '#2563EB'
    }
  })))
  edges.value.update(edges.value.get().map(edge => ({
    id: edge.id,
    color: '#93C5FD',
    width: 2
  })))
  startNode.value = null
  endNode.value = null
  path.value = []
}

const initNetwork = () => {
  const container = document.querySelector('.network-container')
  network.value = new Network(
    container,
    { nodes: nodes.value, edges: edges.value },
    options
  )
  network.value.on('click', handleNodeClick)
  network.value.on('dragEnd', () => {
    const positions = network.value.getPositions()
    nodes.value.update(
      Object.entries(positions).map(([id, pos]) => ({
        id: parseInt(id),
        x: pos.x,
        y: pos.y
      })
    ))
    updateConnections()
    if (path.value.length > 0) findShortestPath()
  })
}

// Хуки жизненного цикла
onMounted(() => {
  initNetwork()
  setTimeout(() => {
    for (let i = 0; i < 5; i++) addNode()
  }, 50)
})

onBeforeUnmount(() => {
  if (network.value) {
    network.value.off('click')
    network.value.off('dragEnd')
    network.value.destroy()
  }
})
</script>

<template>
  <div class="p-4 text-white font-mono">
    <div class="mb-4 flex flex-wrap gap-4 items-center">
      <button 
        @click="addNode"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Добавить вершину
      </button>
      
      <button 
        @click="resetSelection"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
      >
        Сбросить выбор
      </button>
      
      <div class="flex items-center gap-2">
        <span class="text-sm">Старт:</span>
        <span class="px-2 py-1 bg-green-100 text-green-800 rounded">
          {{ startNode || 'не выбрана' }}
        </span>
        <span class="text-sm">Финиш:</span>
        <span class="px-2 py-1 bg-red-100 text-red-800 rounded">
          {{ endNode || 'не выбрана' }}
        </span>
      </div>
      
      <div v-if="path.length > 0" class="ml-auto px-3 py-1 bg-yellow-100 text-yellow-800 rounded">
        Длина пути: {{ calculatePathLength().toFixed(2) }}
      </div>
    </div>

    <div 
      class="network-container border border-gray-300 rounded-lg bg-white p-2 h-[600px]"
    ></div>
    
    <FooterMap/>
  </div>
</template>