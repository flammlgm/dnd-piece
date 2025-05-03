<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import axios from 'axios'
import Button from "@/components/UI/Button/Button.vue"
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isMaster = computed(() => authStore.user?.role === 'master');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Константы
const MAX_CONNECTION_DISTANCE = 300

// Реактивные данные
const nodes = ref(new DataSet([]))
const edges = ref(new DataSet([]))
const network = ref(null)
const startNode = ref(null)
const endNode = ref(null)
const path = ref([])
const selectedNode = ref(null)
const showNodeEditor = ref(false)
const nodeForm = ref({
  name: '',
  monster_chance: 0,
  pirate_chance: 0,
  patrol_chance: 0,
  storm_chance: 0,
  has_harbor: false
})

// Критерии поиска
const searchCriteria = ref({
  distance: 50,
  monsterRisk: 30,
  pirateRisk: 30,
  patrolRisk: 30,
  stormRisk: 30,
  preferHarbors: true
})

// Статистика пути
const pathStats = computed(() => {
  let distance = 0
  let monsterRisk = 0
  let pirateRisk = 0
  let patrolRisk = 0
  let stormRisk = 0
  let harborCount = 0

  for (let i = 0; i < path.value.length - 1; i++) {
    const node = nodes.value.get(path.value[i])
    const edge = edges.value.get().find(e => 
      (e.from === path.value[i] && e.to === path.value[i+1]) ||
      (e.to === path.value[i] && e.from === path.value[i+1]))
    
    if (node) {
      monsterRisk += node.monster_chance || 0
      pirateRisk += node.pirate_chance || 0
      patrolRisk += node.patrol_chance || 0
      stormRisk += node.storm_chance || 0
      if (node.has_harbor) harborCount++
    }
    
    if (edge) distance += edge.length
  }

  const nodeCount = Math.max(1, path.value.length)
  return {
    distance: distance.toFixed(2),
    monsterRisk: (monsterRisk / nodeCount).toFixed(2),
    pirateRisk: (pirateRisk / nodeCount).toFixed(2),
    patrolRisk: (patrolRisk / nodeCount).toFixed(2),
    stormRisk: (stormRisk / nodeCount).toFixed(2),
    harborCount,
    dangerScore: (
      parseFloat(monsterRisk) * searchCriteria.value.monsterRisk +
      parseFloat(pirateRisk) * searchCriteria.value.pirateRisk +
      parseFloat(patrolRisk) * searchCriteria.value.patrolRisk +
      parseFloat(stormRisk) * searchCriteria.value.stormRisk
    ).toFixed(2)
  }
})

// Настройки визуализации
const options = computed(() => ({
  nodes: {
    shape: 'dot',
    size: 10,
    borderWidth: 3,
    color: {
      background: '#4C8BF5',
      border: '#2A5F9E',
      highlight: {
        background: '#F5A623',
        border: '#E08C1C'
      }
    },
    fixed: {
      x: !isMaster.value, // Фиксируем позицию, если не мастер
      y: !isMaster.value  // Фиксируем позицию, если не мастер
    },  
    font: {
      size: 12,
      color: '#FFFFFF',
      strokeWidth: 3,
      strokeColor: '#1A365D'
    }
  },
  edges: {
    width: 2,
    color: '#7FB3D5',
    smooth: false,
    selectionWidth: 0,
    arrows: { to: false },
    dashes: false,
    font: { size: 0 }
  },
  physics: {
    enabled: false,
    stabilization: {
      fit: true,
      iterations: 1000
    }
  },
  interaction: {
    dragNodes: isMaster.value, // Разрешаем перетаскивание только мастеру
    dragView: true,
    zoomView: true,
    multiselect: false,
    selectConnectedEdges: false
  },
  layout: {
    randomSeed: undefined,
    improvedLayout: true
  },
  configure: {
    enabled: false
  },
  width: '100%',
  height: '100%'
}))

// Загрузка данных
const loadData = async () => {
  try {
    const islandsRes = await axios.get(`${API_BASE_URL}/islands`)
    
    nodes.value.clear()
    nodes.value.add(islandsRes.data.map(island => ({
      id: island.id,
      label: island.name || `Остров ${island.id}`,
      x: Math.max(0, Math.min(1400, Number(island.x) || 0)),
      y: Math.max(0, Math.min(900, Number(island.y) || 0)),
      monster_chance: Math.max(0, Math.min(100, Number(island.monster_chance) || 0)),
      pirate_chance: Math.max(0, Math.min(100, Number(island.pirate_chance) || 0)),
      patrol_chance: Math.max(0, Math.min(100, Number(island.patrol_chance) || 0)),
      storm_chance: Math.max(0, Math.min(100, Number(island.storm_chance) || 0)),
      has_harbor: Boolean(island.has_harbor),
      color: getNodeColor(island)
    })))

    // Генерируем соединения на клиенте
    generateConnections()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    alert('Не удалось загрузить данные. Пожалуйста, проверьте консоль для подробностей.')
  }
}

// Генерация соединений между островами
const generateConnections = () => {
  edges.value.clear()
  const islandNodes = nodes.value.get()
  
  for (let i = 0; i < islandNodes.length; i++) {
    for (let j = i + 1; j < islandNodes.length; j++) {
      const node1 = islandNodes[i]
      const node2 = islandNodes[j]
      const dx = node1.x - node2.x
      const dy = node1.y - node2.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance <= MAX_CONNECTION_DISTANCE) {
        edges.value.add({
          id: `${node1.id}-${node2.id}`,
          from: node1.id,
          to: node2.id,
          // label: Math.round(distance).toString(),
          length: distance,
          width: 2,
          color: '#7FB3D5'
        })
        console.log(`Added connection: ${node1.id}-${node2.id} (${Math.round(distance)})`)
      }
    }
  }
}

// Цвета узлов в зависимости от свойств
const getNodeColor = (node) => {
  if (node.has_harbor) {
    return {
      background: '#10B981',
      border: '#059669',
      highlight: {
        background: '#F5A623',
        border: '#E08C1C'
      }
    }
  }
  
  const dangerScore = (
    (node.monster_chance || 0) * 0.3 +
    (node.pirate_chance || 0) * 0.3 +
    (node.patrol_chance || 0) * 0.2 +
    (node.storm_chance || 0) * 0.2
  )
  
  if (dangerScore > 70) {
    return {
      background: '#EF4444',
      border: '#DC2626',
      highlight: {
        background: '#F59E0B',
        border: '#D97706'
      }
    }
  } else if (dangerScore > 30) {
    return {
      background: '#F59E0B',
      border: '#D97706',
      highlight: {
        background: '#EF4444',
        border: '#DC2626'
      }
    }
  }
  
  return {
    background: '#4C8BF5',
    border: '#2A5F9E',
    highlight: {
      background: '#F5A623',
      border: '#E08C1C'
    }
  }
}

// Обработчики событий
const handleNodeClick = async (params) => {
  if (params.nodes.length === 1) {
    const nodeId = params.nodes[0]
    const node = nodes.value.get(nodeId)
    
    console.log('Clicked node:', node)
    
    if (!startNode.value) {
      startNode.value = nodeId
      nodes.value.update({ 
        id: nodeId,
        color: {
          background: '#10B981',
          border: '#059669',
          highlight: {
            background: '#F5A623',
            border: '#E08C1C'
          }
        }
      })
    } else if (!endNode.value && nodeId !== startNode.value) {
      endNode.value = nodeId
      nodes.value.update({ 
        id: nodeId,
        color: {
          background: '#EF4444',
          border: '#DC2626',
          highlight: {
            background: '#F5A623',
            border: '#E08C1C'
          }
        }
      })
      await findOptimalPath()
    }
  }
  console.log('Current graph:', {
    nodes: nodes.value.get(),
    edges: edges.value.get(),
    start: startNode.value,
    end: endNode.value
  });
}

const handleDoubleClick = (params) => {
  if (params.nodes.length === 1 && isMaster.value) {
    selectedNode.value = params.nodes[0]
    const node = nodes.value.get(selectedNode.value)
    nodeForm.value = {
      name: node.label,
      monster_chance: node.monster_chance || 0,
      pirate_chance: node.pirate_chance || 0,
      patrol_chance: node.patrol_chance || 0,
      storm_chance: node.storm_chance || 0,
      has_harbor: node.has_harbor || false
    }
    showNodeEditor.value = true
  }
}

// Алгоритм поиска пути
const findOptimalPath = async () => {
  try {
    if (!startNode.value || !endNode.value) {
      console.warn('Start or end node not selected')
      return
    }

    // Логируем текущие соединения для отладки
    console.log('Current connections:', edges.value.get().map(e => `${e.from}-${e.to} (${e.length})`))

    // Строим структуру графа
    const graph = {}
    const allNodes = nodes.value.get()
    
    allNodes.forEach(node => {
      graph[node.id] = {
        ...node,
        edges: edges.value.get()
          .filter(e => e.from === node.id || e.to === node.id)
          .map(e => ({
            to: e.from === node.id ? e.to : e.from,
            distance: e.length,
            id: e.id // Добавляем ID соединения для отладки
          }))
      }
    })

    console.log('Full graph structure:', JSON.parse(JSON.stringify(graph)))

    // Проверка существования узлов в графе
    if (!graph[startNode.value] || !graph[endNode.value]) {
      alert('Один из островов не найден в графе!')
      return
    }

    // Проверка связности графа
    if (!checkGraphConnectivity(graph, startNode.value, endNode.value)) {
      alert('Нет возможного пути между выбранными островами!')
      return
    }

    // Проверка прямого соединения
    const directConnection = graph[startNode.value].edges.find(e => e.to === endNode.value)
    if (directConnection) {
      console.log('Direct connection found:', directConnection)
      path.value = [startNode.value, endNode.value]
      highlightPath()
      return
    }

    // Поиск пути алгоритмом Дейкстры
    const pathResult = dijkstra(graph, startNode.value, endNode.value, searchCriteria.value)
    
    if (pathResult.length > 0) {
      console.log('Path found:', pathResult)
      path.value = pathResult
      highlightPath()
    } else {
      console.warn('No path found with current criteria')
      alert('Путь не найден. Попробуйте изменить критерии поиска или проверьте соединения между островами.')
      path.value = []
    }
  } catch (error) {
    console.error('Path finding error:', error)
    alert('Произошла ошибка при поиске пути. Пожалуйста, проверьте консоль для подробностей.')
  }
}

// Функция проверки связности графа
const checkGraphConnectivity = (graph, start, end) => {
  const visited = new Set()
  const stack = [start]
  
  while (stack.length > 0) {
    const node = stack.pop()
    
    if (node === end) return true
    if (visited.has(node)) continue
    
    visited.add(node)
    
    if (graph[node] && graph[node].edges) {
      for (const edge of graph[node].edges) {
        if (!visited.has(edge.to)) {
          stack.push(edge.to)
        }
      }
    }
  }
  
  return false
}

// Реализация алгоритма Дейкстры
const dijkstra = (graph, start, end, criteria) => {
  console.log('Running Dijkstra from', start, 'to', end, 'with criteria:', criteria)
  
  // Инициализация
  const distances = {}
  const previous = {}
  const visited = new Set()
  const queue = new PriorityQueue()

  // Все узлы начинаются с бесконечного расстояния
  for (const nodeId in graph) {
    distances[nodeId] = Infinity
    previous[nodeId] = null
  }
  distances[start] = 0
  
  queue.enqueue(start, 0)

  while (!queue.isEmpty()) {
    const { element: current, priority: currentDistance } = queue.dequeue()
    
    console.log('Processing node:', current, 'with distance:', currentDistance)
    
    // Если достигли конечного узла
    if (current === end) {
      // Восстанавливаем путь
      const path = []
      let node = end
      while (node !== null && node !== start) {
        path.unshift(node)
        node = previous[node]
      }
      if (node === start) {
        path.unshift(start)
        console.log('Found path:', path)
        return path
      }
      console.warn('Path reconstruction failed')
      return []
    }

    // Пропускаем уже посещенные узлы
    if (visited.has(current)) continue
    visited.add(current)

    // Проверка существования узла в графе
    if (!graph[current]) {
      console.warn('Node not found in graph:', current)
      continue
    }

    // Обрабатываем все соединения текущего узла
    for (const edge of graph[current].edges) {
      const neighbor = edge.to
      
      // Пропускаем посещенных соседей
      if (visited.has(neighbor)) continue
      
      // Проверяем существование соседа
      if (!graph[neighbor]) {
        console.warn('Neighbor node not found:', neighbor)
        continue
      }

      // Базовый вес - просто расстояние (гарантированно найдем хоть какой-то путь)
      const baseWeight = edge.distance
      
      // Дополнительные факторы (делаем их влияние слабее)
      const riskFactor = (
        graph[neighbor].monster_chance * 0.01 * criteria.monsterRisk +
        graph[neighbor].pirate_chance * 0.01 * criteria.pirateRisk +
        graph[neighbor].patrol_chance * 0.01 * criteria.patrolRisk +
        graph[neighbor].storm_chance * 0.01 * criteria.stormRisk
      ) / 100
      
      const harborBonus = criteria.preferHarbors && graph[neighbor].has_harbor ? -0.3 : 0
      
      // Общий вес перехода (основной вес - расстояние)
      const totalWeight = baseWeight * (1 + riskFactor + harborBonus)
      
      // Альтернативный путь
      const altDistance = distances[current] + totalWeight
      
      // Если нашли более короткий путь
      if (altDistance < distances[neighbor]) {
        distances[neighbor] = altDistance
        previous[neighbor] = current
        queue.enqueue(neighbor, altDistance)
        
        console.log(`Updated distance to ${neighbor}: ${altDistance} (via ${current})`)
      }
    }
  }
  
  // Если путь не найжен стандартным способом, попробуем найти любой путь
  console.warn('Standard Dijkstra failed, trying fallback BFS...')
  return findAnyPath(graph, start, end)
}

// Резервный алгоритм поиска любого пути (BFS)
const findAnyPath = (graph, start, end) => {
  const queue = [[start]]
  const visited = new Set([start])

  while (queue.length > 0) {
    const path = queue.shift()
    const node = path[path.length - 1]

    if (node === end) {
      console.log('Fallback BFS found path:', path)
      return path
    }

    if (graph[node] && graph[node].edges) {
      for (const edge of graph[node].edges) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to)
          queue.push([...path, edge.to])
        }
      }
    }
  }

  console.error('No path exists between', start, 'and', end)
  return []
}

// Приоритетная очередь для алгоритма Дейкстры
class PriorityQueue {
  constructor() {
    this.items = []
  }
  
  enqueue(element, priority) {
    const item = { element, priority }
    
    // Оптимизированная вставка с бинарным поиском
    let low = 0
    let high = this.items.length
    
    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (this.items[mid].priority < item.priority) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    
    this.items.splice(low, 0, item)
  }
  
  dequeue() {
    if (this.isEmpty()) {
      console.warn('Dequeue from empty priority queue')
      return null
    }
    return this.items.shift()
  }
  
  isEmpty() {
    return this.items.length === 0
  }
  
  print() {
    console.log('Queue:', this.items.map(i => `${i.element}:${i.priority}`))
  }
}

// Подсветка пути
const highlightPath = () => {
  // Сбрасываем все стили
  nodes.value.update(nodes.value.get().map(node => ({
    id: node.id,
    color: getNodeColor(node)
  })))

  edges.value.update(edges.value.get().map(edge => ({
    id: edge.id,
    color: '#7FB3D5',
    width: 2,
    shadow: false
  })))

  // Подсвечиваем узлы пути
  path.value.forEach(nodeId => {
    nodes.value.update({
      id: nodeId,
      color: {
        background: '#F59E0B',
        border: '#D97706',
        highlight: {
          background: '#EF4444',
          border: '#DC2626'
        }
      }
    })
  })

  // Подсвечиваем рёбра пути
  for (let i = 0; i < path.value.length - 1; i++) {
    const from = path.value[i]
    const to = path.value[i+1]
    
    const edge = edges.value.get().find(e => 
      (e.from === from && e.to === to) || 
      (e.to === from && e.from === to))
    
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

// Работа с узлами
const addNode = async () => {
  try {
    const x = Math.floor(Math.random() * 1400)
    const y = Math.floor(Math.random() * 900)
    
    const response = await axios.post(`${API_BASE_URL}/islands`, {
      name: `Остров ${nodes.value.length + 1}`,
      x,
      y,
      monster_chance: Math.floor(Math.random() * 100),
      pirate_chance: Math.floor(Math.random() * 100),
      patrol_chance: Math.floor(Math.random() * 100),
      storm_chance: Math.floor(Math.random() * 100),
      has_harbor: Math.random() > 0.7
    })
    
    const newIsland = response.data
    nodes.value.add({
      id: newIsland.id,
      label: newIsland.name,
      x: newIsland.x,
      y: newIsland.y,
      monster_chance: Number(newIsland.monster_chance) || 0,
      pirate_chance: Number(newIsland.pirate_chance) || 0,
      patrol_chance: Number(newIsland.patrol_chance) || 0,
      storm_chance: Number(newIsland.storm_chance) || 0,
      has_harbor: Boolean(newIsland.has_harbor),
      color: getNodeColor(newIsland)
    })
    
    // Обновляем соединения
    generateConnections()
  } catch (error) {
    console.error('Ошибка добавления острова:', error)
    alert('Не удалось добавить остров. Пожалуйста, проверьте консоль для подробностей.')
  }
}

const updateNode = async () => {
  if (!selectedNode.value) return

  try {
    const response = await axios.put(`${API_BASE_URL}/islands/${selectedNode.value}`, {
      name: String(nodeForm.value.name),
      monster_chance: Math.max(0, Math.min(100, Number(nodeForm.value.monster_chance) || 0)),
      pirate_chance: Math.max(0, Math.min(100, Number(nodeForm.value.pirate_chance) || 0)),
      patrol_chance: Math.max(0, Math.min(100, Number(nodeForm.value.patrol_chance) || 0)),
      storm_chance: Math.max(0, Math.min(100, Number(nodeForm.value.storm_chance) || 0)),
      has_harbor: Boolean(nodeForm.value.has_harbor)
    })
    
    const updatedIsland = response.data
    nodes.value.update({
      id: updatedIsland.id,
      label: updatedIsland.name,
      monster_chance: Number(updatedIsland.monster_chance) || 0,
      pirate_chance: Number(updatedIsland.pirate_chance) || 0,
      patrol_chance: Number(updatedIsland.patrol_chance) || 0,
      storm_chance: Number(updatedIsland.storm_chance) || 0,
      has_harbor: Boolean(updatedIsland.has_harbor),
      color: getNodeColor(updatedIsland)
    })
    
    showNodeEditor.value = false
    if (path.value.length > 0) await findOptimalPath()
  } catch (error) {
    console.error('Ошибка обновления острова:', error)
  }
}

const resetSelection = () => {
  nodes.value.update(nodes.value.get().map(node => ({
    id: node.id,
    color: getNodeColor(node)
  })))
  
  edges.value.update(edges.value.get().map(edge => ({
    id: edge.id,
    color: '#7FB3D5',
    width: 2
  })))
  
  startNode.value = null
  endNode.value = null
  path.value = []
}

// Инициализация
onMounted(async () => {
  const container = document.querySelector('.network-container')
  if (!container) {
    console.error('Контейнер для сети не найден')
    return
  }

  network.value = new Network(
    container,
    { nodes: nodes.value, edges: edges.value },
    options.value // Используем options.value
  )
  
  network.value.on('click', handleNodeClick)
  network.value.on('doubleClick', handleDoubleClick)
  network.value.on('dragEnd', handleDragEnd)
  
  await loadData()

  // Обновляем настройки при изменении роли пользователя
  watch(isMaster, () => {
    if (network.value) {
      network.value.setOptions(options.value)
    }
  })
})

// Обработчик перемещения узлов
const handleDragEnd = async () => {
  if (!isMaster.value) return;
  try {
    const positions = network.value.getPositions()
    const updates = Object.entries(positions).map(async ([id, pos]) => {
      const x = Math.max(0, Math.min(1400, pos.x))
      const y = Math.max(0, Math.min(900, pos.y))
      
      try {
        await axios.put(`${API_BASE_URL}/islands/${id}`, { x, y })
        nodes.value.update({ id: parseInt(id), x, y })
      } catch (error) {
        console.error('Ошибка обновления острова:', id, error)
      }
    })

    await Promise.all(updates)
    
    // Обновляем соединения после перемещения
    generateConnections()
    if (path.value.length > 0) await findOptimalPath()
  } catch (error) {
    console.error('Ошибка в обработчике dragEnd:', error)
  }
}

const deleteNode = async () => {
  if (!selectedNode.value) return
  
  try {
    showNodeEditor.value = false
    resetSelection()
    await axios.delete(`${API_BASE_URL}/islands/${selectedNode.value}`)
    nodes.value.remove(selectedNode.value)
    generateConnections() // Обновляем соединения
  } catch (error) {
    console.error('Ошибка удаления острова:', error)
  }
}
</script>

<template>
  <div class="world-map-page bg-gray-900 text-white font-mono min-h-screen p-6">
    <!-- Заголовок и кнопки управления -->
    <h1 class="text-white font-bold text-5xl m-10">Карта</h1>

    <!-- Карта -->
    <div class="flex-1 relative h-full">
      <div 
        class="network-container w-full rounded-2xl border-2 border-gray-700 bg-gray-900 shadow-lg"
        style="background-image: radial-gradient(circle at 1px 1px, #4B5563 1px, transparent 0);
               background-size: 40px 40px;"
      ></div>
    </div>

    <!-- Критерии поиска -->
    <div class="mt-4 p-3 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 flex">
      <div>
        <h3 class="text-xl font-bold mb-4">Критерии поиска пути</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Дистанция ({{ searchCriteria.distance }}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model.number="searchCriteria.distance" 
              @input="findOptimalPath"
              class="w-full h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Морские чудовища ({{ searchCriteria.monsterRisk }}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model.number="searchCriteria.monsterRisk" 
              @input="findOptimalPath"
              class="w-full h-2 bg-purple-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Пираты ({{ searchCriteria.pirateRisk }}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model.number="searchCriteria.pirateRisk" 
              @input="findOptimalPath"
              class="w-full h-2 bg-red-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Морской дозор ({{ searchCriteria.patrolRisk }}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model.number="searchCriteria.patrolRisk" 
              @input="findOptimalPath"
              class="w-full h-2 bg-yellow-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Штормы ({{ searchCriteria.stormRisk }}%)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              v-model.number="searchCriteria.stormRisk" 
              @input="findOptimalPath"
              class="w-full h-2 bg-cyan-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="preferHarbors" 
              v-model="searchCriteria.preferHarbors" 
              @change="findOptimalPath"
              class="w-5 h-5 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
            >
            <label for="preferHarbors" class="ml-3 text-sm font-medium text-gray-300">Предпочитать порты</label>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-4 items-center mx-10">
        <Button 
          v-if="isMaster" 
          @click="addNode" 
          text="Добавить остров" 
          type="primary" 
          size="medium" 
          class="font-bold"
        />
        <Button 
          @click="resetSelection" 
          text="Сбросить выбор" 
          type="danger" 
          size="medium" 
          class="font-bold"
        />
        
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm">Старт:</span>
            <span class="px-3 py-1.5 bg-green-900/50 text-green-300 rounded-lg font-medium">
              {{ startNode ? nodes.get(startNode).label : 'не выбран' }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">Финиш:</span>
            <span class="px-3 py-1.5 bg-red-900/50 text-red-300 rounded-lg font-medium">
              {{ endNode ? nodes.get(endNode).label : 'не выбран' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Статистика пути -->
    <div v-if="path.length > 0" class="mt-6 p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <h3 class="text-xl font-bold mb-4 text-blue-400">Статистика маршрута</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 bg-blue-900/30 rounded-xl border border-blue-800">
          <div class="text-sm font-medium text-blue-300">Общая дистанция</div>
          <div class="text-xl font-bold">{{ pathStats.distance }}</div>
        </div>
        <div class="p-4 bg-purple-900/30 rounded-xl border border-purple-800">
          <div class="text-sm font-medium text-purple-300">Опасность чудовищ</div>
          <div class="text-xl font-bold">{{ pathStats.monsterRisk }}%</div>
        </div>
        <div class="p-4 bg-red-900/30 rounded-xl border border-red-800">
          <div class="text-sm font-medium text-red-300">Опасность пиратов</div>
          <div class="text-xl font-bold">{{ pathStats.pirateRisk }}%</div>
        </div>
        <div class="p-4 bg-yellow-900/30 rounded-xl border border-yellow-800">
          <div class="text-sm font-medium text-yellow-300">Опасность патруля</div>
          <div class="text-xl font-bold">{{ pathStats.patrolRisk }}%</div>
        </div>
        <div class="p-4 bg-cyan-900/30 rounded-xl border border-cyan-800">
          <div class="text-sm font-medium text-cyan-300">Опасность шторма</div>
          <div class="text-xl font-bold">{{ pathStats.stormRisk }}%</div>
        </div>
        <div class="p-4 bg-green-900/30 rounded-xl border border-green-800">
          <div class="text-sm font-medium text-green-300">Порты на пути</div>
          <div class="text-xl font-bold">{{ pathStats.harborCount }}</div>
        </div>
        <div class="p-4 bg-orange-900/30 rounded-xl border border-orange-800">
          <div class="text-sm font-medium text-orange-300">Общий показатель опасности</div>
          <div class="text-xl font-bold">{{ pathStats.dangerScore }}</div>
        </div>
      </div>
    </div>

    <!-- Редактор узла -->
    <div v-if="showNodeEditor && isMaster" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-700">
        <h3 class="text-2xl font-bold mb-6 text-blue-400">Редактирование острова</h3>
        
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Название</label>
            <input 
              v-model="nodeForm.name" 
              type="text" 
              class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Чудовища (%)</label>
              <input 
                v-model.number="nodeForm.monster_chance" 
                type="number" 
                min="0" 
                max="100"
                class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Пираты (%)</label>
              <input 
                v-model.number="nodeForm.pirate_chance" 
                type="number" 
                min="0" 
                max="100"
                class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Дозор (%)</label>
              <input 
                v-model.number="nodeForm.patrol_chance" 
                type="number" 
                min="0" 
                max="100"
                class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Штормы (%)</label>
              <input 
                v-model.number="nodeForm.storm_chance" 
                type="number" 
                min="0" 
                max="100"
                class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>
          
          <div class="flex items-center">
            <input 
              v-model="nodeForm.has_harbor" 
              type="checkbox" 
              class="w-5 h-5 text-blue-600 border-gray-600 bg-gray-700 rounded focus:ring-blue-500"
            >
            <label class="ml-3 block text-sm text-gray-300">Есть порт/убежище</label>
          </div>
        </div>
        
        <div class="mt-8 flex justify-between">
          <button 
            @click="deleteNode"
            class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-medium"
          >
            Удалить
          </button>
          <div class="flex space-x-4">
            <button 
              @click="showNodeEditor = false" 
              class="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition font-medium"
            >
              Отмена
            </button>
            <button 
              @click="updateNode" 
              class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.world-map-page {
  max-width: 1400px;
  margin: 0 auto;
}

.network-container {
  min-height: 600px;
  height: 70vh;
  width: 100%;
  position: relative;
  overflow: visible !important; 
}

/* Стили для ползунков */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  background: currentColor;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

input[type="range"][class*="bg-blue"]::-webkit-slider-thumb {
  background: #3B82F6;
}
input[type="range"][class*="bg-purple"]::-webkit-slider-thumb {
  background: #8B5CF6;
}
input[type="range"][class*="bg-red"]::-webkit-slider-thumb {
  background: #EF4444;
}
input[type="range"][class*="bg-yellow"]::-webkit-slider-thumb {
  background: #F59E0B;
}
input[type="range"][class*="bg-cyan"]::-webkit-slider-thumb {
  background: #06B6D4;
}
</style>