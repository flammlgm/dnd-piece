<script>
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'

export default {
  data() {
    return {
      nodes: new DataSet([]),
      edges: new DataSet([]),
      nodeCounter: 1,
      network: null,
      connectionCount: 6,
      maxConnectionDistance: 400,
      startNode: null,
      endNode: null,
      path: [],
      options: {
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
    }
  },

  methods: {
    addNode() {
      const id = this.nodeCounter++
      const x = Math.random() * 800
      const y = Math.random() * 500
      this.nodes.add({ 
        id, 
        label: `${id}`, 
        x, 
        y,
        color: {
          background: '#3b82f6',
          border: '#2563eb'
        }
      })
      this.updateConnections()
    },

    updateConnections() {
      if (this.nodes.length < 2) {
        this.edges.clear()
        return
      }

      const nodes = this.nodes.get()
      const newEdges = []
      const edgeSet = new Set()
      const connectionMap = new Map(nodes.map(node => [node.id, new Set()]))

      // Для каждой ноды находим ближайших соседей
      nodes.forEach(currentNode => {
        const neighbors = []
        
        // Собираем всех возможных соседей
        nodes.forEach(targetNode => {
          if (currentNode.id === targetNode.id) return
          
          const dist = this.calculateDistance(currentNode, targetNode)
          if (dist <= this.maxConnectionDistance) {
            neighbors.push({
              id: targetNode.id,
              distance: dist
            })
          }
        })

        // Сортируем по расстоянию и берем первых N
        neighbors.sort((a, b) => a.distance - b.distance)
        const bestNeighbors = neighbors.slice(0, this.connectionCount)

        // Добавляем связи
        bestNeighbors.forEach(neighbor => {
          const edgeId = this.getEdgeId(currentNode.id, neighbor.id)
          
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

      // Удаляем избыточные связи
      const finalEdges = newEdges.filter(edge => {
        const fromConnections = connectionMap.get(edge.from)
        const toConnections = connectionMap.get(edge.to)
        return fromConnections.has(edge.to) && toConnections.has(edge.from)
      })

      this.edges.clear()
      this.edges.add(finalEdges)
    },

    getEdgeId(from, to) {
      return [from, to].sort().join('-')
    },

    calculateDistance(node1, node2) {
      const dx = node1.x - node2.x
      const dy = node1.y - node2.y
      return Math.sqrt(dx * dx + dy * dy)
    },

    handleNodeClick(params) {
      if (params.nodes.length === 1) {
        const nodeId = params.nodes[0]
        if (!this.startNode) {
          this.startNode = nodeId
          this.nodes.update({ 
            id: nodeId,
            color: {
              background: '#10B981',
              border: '#059669'
            }
          })
        } else if (!this.endNode && nodeId !== this.startNode) {
          this.endNode = nodeId
          this.nodes.update({ 
            id: nodeId,
            color: {
              background: '#EF4444',
              border: '#DC2626'
            }
          })
          this.findShortestPath()
        }
      }
    },

    findShortestPath() {
      if (!this.startNode || !this.endNode) return

      const nodes = this.nodes.get()
      const edges = this.edges.get()
      const distances = {}
      const previous = {}
      const unvisited = new Set()

      nodes.forEach(node => {
        distances[node.id] = node.id === this.startNode ? 0 : Infinity
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

        if (current === null || current === this.endNode) break
        unvisited.delete(current)

        edges.forEach(edge => {
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

      this.path = []
      let current = this.endNode
      while (current !== null) {
        this.path.unshift(current)
        current = previous[current]
      }

      this.highlightPath()
    },

    highlightPath() {
      // Сброс стилей
      this.nodes.update(this.nodes.get().map(node => ({
        id: node.id,
        color: {
          background: node.id === this.startNode ? '#10B981' : 
                    node.id === this.endNode ? '#EF4444' : '#3B82F6',
          border: node.id === this.startNode ? '#059669' :
                 node.id === this.endNode ? '#DC2626' : '#2563EB'
        }
      })))

      this.edges.update(this.edges.get().map(edge => ({
        id: edge.id,
        color: '#93C5FD',
        width: 2
      })))

      // Подсветка пути
      this.path.forEach(nodeId => {
        this.nodes.update({
          id: nodeId,
          color: {
            background: '#F59E0B',
            border: '#D97706'
          }
        })
      })

      for (let i = 0; i < this.path.length - 1; i++) {
        const from = this.path[i]
        const to = this.path[i+1]
        const edge = this.edges.get().find(e => 
          (e.from === from && e.to === to) || (e.from === to && e.to === from))
        
        if (edge) {
          this.edges.update({
            id: edge.id,
            color: '#F59E0B',
            width: 4,
            shadow: true
          })
        }
      }
    },

    calculatePathLength() {
      let length = 0
      for (let i = 0; i < this.path.length - 1; i++) {
        const edge = this.edges.get().find(e => 
          (e.from === this.path[i] && e.to === this.path[i+1]) ||
          (e.to === this.path[i] && e.from === this.path[i+1]))
        if (edge) length += edge.length
      }
      return length
    },

    resetSelection() {
      this.nodes.update(this.nodes.get().map(node => ({
        id: node.id,
        color: {
          background: '#3B82F6',
          border: '#2563EB'
        }
      })))
      this.edges.update(this.edges.get().map(edge => ({
        id: edge.id,
        color: '#93C5FD',
        width: 2
      })))
      this.startNode = null
      this.endNode = null
      this.path = []
    },

    initNetwork() {
      this.network = new Network(
        this.$refs.networkContainer,
        { nodes: this.nodes, edges: this.edges },
        this.options
      )
      this.network.on('click', this.handleNodeClick)
      this.network.on('dragEnd', () => {
        // Обновляем координаты после перемещения
        const positions = this.network.getPositions()
        this.nodes.update(
          Object.entries(positions).map(([id, pos]) => ({
            id: parseInt(id),
            x: pos.x,
            y: pos.y
          })
        ))
        this.updateConnections()
        if (this.path.length > 0) this.findShortestPath()
      })
    }
  },

  mounted() {
    this.initNetwork()
    setTimeout(() => {
      for (let i = 0; i < 5; i++) this.addNode()
    }, 50)
  },

  beforeUnmount() {
    if (this.network) {
      this.network.off('click')
      this.network.off('dragEnd')
      this.network.destroy()
    }
  }
}
</script>

<template>
  <div class="p-4">
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
      ref="networkContainer" 
      class="border border-gray-300 rounded-lg bg-white p-2 h-[600px]"
    ></div>
    
    <div class="mt-4 text-sm text-gray-600">
      <p>• Кликните по вершине чтобы выбрать стартовую точку (зелёная)</p>
      <p>• Кликните по другой вершине чтобы выбрать финиш (красная)</p>
      <p>• Перетаскивайте вершины для изменения структуры графа</p>
      <p>• Путь автоматически пересчитается при изменениях</p>
    </div>
  </div>
</template>