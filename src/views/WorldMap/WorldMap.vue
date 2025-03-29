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
      options: {
        nodes: {
          shape: 'dot',
          size: 15,
          color: '#3b82f6',
          font: { color: '#343434', size: 12 }
        },
        edges: {
          width: 1,
          color: '#93c5fd',
          smooth: false
        },
        physics: false,
        interaction: {
          dragNodes: true,
          selectable: true
        }
      }
    }
  },

  methods: {
    addNode() {
      const id = this.nodeCounter++
      const x = Math.random() * 800
      const y = Math.random() * 500
      
      this.nodes.add({ id, label: `${id}`, x, y })
      this.updateConnections()
    },

    // Обновляем связи при любом изменении позиции
    handleNodeDrag() {
      if (this.dynamicConnections) {
        const movedNodes = this.network.getPositions()
        Object.entries(movedNodes).forEach(([id, pos]) => {
          this.nodes.update({ id, x: pos.x, y: pos.y })
        })
        this.updateConnections()
      }
    },

    updateConnections() {
      if (this.nodes.length < 2) {
        this.edges.clear()
        return
      }

      const nodes = this.nodes.get()
      const newEdges = []
      const connectionMap = {}

      // 1. Собираем все возможные пары и сортируем по расстоянию
      const allPairs = []
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          allPairs.push({
            from: nodes[i].id,
            to: nodes[j].id,
            distance: this.calculateDistance(nodes[i], nodes[j])
          })
        }
      }
      allPairs.sort((a, b) => a.distance - b.distance)

      // 2. Инициализируем счетчик связей
      nodes.forEach(node => {
        connectionMap[node.id] = 0
      })

      // 3. Добавляем связи, пока не достигнем лимита
      allPairs.forEach(pair => {
        if (connectionMap[pair.from] < this.connectionCount && 
            connectionMap[pair.to] < this.connectionCount) {
          newEdges.push({
            id: `${pair.from}-${pair.to}`,
            from: pair.from,
            to: pair.to
          })
          connectionMap[pair.from]++
          connectionMap[pair.to]++
        }
      })

      // 4. Применяем изменения
      this.edges.clear()
      this.edges.add(newEdges)
    },

    calculateDistance(node1, node2) {
      const dx = node1.x - node2.x
      const dy = node1.y - node2.y
      return Math.sqrt(dx * dx + dy * dy)
    },

    initNetwork() {
      this.network = new Network(
        this.$refs.networkContainer,
        { nodes: this.nodes, edges: this.edges },
        this.options
      )

      // Вешаем обработчик перемещения в реальном времени
      this.network.on('drag', this.handleNodeDrag)
    }
  },

  mounted() {
    this.initNetwork()
    // Стартовые вершины
    for (let i = 0; i < 5; i++) this.addNode()
  },

  beforeUnmount() {
    if (this.network) {
      this.network.off('drag')
      this.network.destroy()
    }
  }
}
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex gap-2 items-center">
      <button 
        @click="addNode"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Добавить вершину
      </button>
      <span class="text-sm text-gray-600">
        Максимум {{ connectionCount }} связей на вершину
      </span>
    </div>

    <div 
      ref="networkContainer" 
      class="border border-gray-300 rounded-lg bg-white p-2 h-[600px]"
    ></div>
  </div>
</template>