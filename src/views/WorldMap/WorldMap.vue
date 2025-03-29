<script>
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'

export default {
  data() {
    return {
      nodes: new DataSet([]),  // Хранилище вершин
      edges: new DataSet([]),  // Хранилище рёбер
      nodeCounter: 1,          // Счётчик для ID вершин
      network: null,           // Ссылка на экземпляр графа
      connectionCount: 6,      // Максимум связей у вершины
      options: {               // Настройки отображения
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
        physics: false,        // Физика отключена
        interaction: {
          dragNodes: true,     // Можно перемещать вершины
          selectable: true     // Можно выбирать вершины
        }
      }
    }
  },

  methods: {
    // Добавление новой вершины
    addNode() {
      const id = this.nodeCounter++
      const x = Math.random() * 800
      const y = Math.random() * 500
      
      this.nodes.add({ id, label: `${id}`, x, y })
      this.updateConnections() // Обновляем связи
    },

    // Основная функция обновления связей
    updateConnections() {
      if (this.nodes.length < 2) {
        this.edges.clear()
        return
      }

      const nodes = this.nodes.get()
      const edgeMap = new Map() // Для уникальных рёбер

      // 1. Собираем все возможные пары вершин
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

      // 2. Сортируем пары по расстоянию (от ближних к дальним)
      allPairs.sort((a, b) => a.distance - b.distance)

      // 3. Считаем текущие связи для каждой вершины
      const connectionCounts = {}
      nodes.forEach(node => {
        connectionCounts[node.id] = 0
      })

      // 4. Добавляем связи, соблюдая лимит
      allPairs.forEach(pair => {
        if (connectionCounts[pair.from] < this.connectionCount && 
            connectionCounts[pair.to] < this.connectionCount) {
          const edgeId = this.getEdgeId(pair.from, pair.to)
          if (!edgeMap.has(edgeId)) {
            edgeMap.set(edgeId, {
              id: edgeId,
              from: pair.from,
              to: pair.to
            })
            connectionCounts[pair.from]++
            connectionCounts[pair.to]++
          }
        }
      })

      // 5. Полное обновление рёбер
      this.edges.clear()
      this.edges.add(Array.from(edgeMap.values()))
    },

    // Генерация ID для ребра (A-B и B-A будут одинаковые)
    getEdgeId(from, to) {
      return [from, to].sort().join('-')
    },

    // Расчёт расстояния между вершинами
    calculateDistance(node1, node2) {
      const dx = node1.x - node2.x
      const dy = node1.y - node2.y
      return Math.sqrt(dx * dx + dy * dy)
    },

    // Обработчик перемещения вершины
    handleNodeDrag() {
      const movedNodes = this.network.getPositions()
      Object.entries(movedNodes).forEach(([id, pos]) => {
        this.nodes.update({ id, x: pos.x, y: pos.y })
      })
      this.updateConnections() // Обновляем связи после перемещения
    },

    // Инициализация графа
    initNetwork() {
      this.network = new Network(
        this.$refs.networkContainer,
        { nodes: this.nodes, edges: this.edges },
        this.options
      )
      // Вешаем обработчик перемещения
      this.network.on('dragEnd', this.handleNodeDrag)
    }
  },

  mounted() {
    this.initNetwork()
    // Добавляем начальные вершины с небольшой задержкой
    setTimeout(() => {
      for (let i = 0; i < 5; i++) this.addNode()
    }, 50)
  },

  beforeUnmount() {
    // Очищаем ресурсы
    if (this.network) {
      this.network.off('dragEnd')
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
        У каждой вершины максимум {{ connectionCount }} связей
      </span>
    </div>

    <!-- Контейнер для графа -->
    <div 
      ref="networkContainer" 
      class="border border-gray-300 rounded-lg bg-white p-2 h-[600px]"
    ></div>
  </div>
</template>