<script setup>
import { ref, onMounted, computed } from 'vue'
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import axios from 'axios'
import FooterMap from './components/FooterMap.vue'

// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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
const options = {
  nodes: {
    shape: 'dot',
    size: 25,
    borderWidth: 3,
    color: {
      background: '#4C8BF5',
      border: '#2A5F9E',
      highlight: {
        background: '#F5A623',
        border: '#E08C1C'
      }
    },
    font: {
      size: 14,
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
    dashes: false
  },
  physics: {
    enabled: false
  },
  interaction: {
    dragNodes: true,
    multiselect: false,
    selectConnectedEdges: false
  }
}

// Загрузка данных
const loadData = async () => {
  try {
    const [islandsRes, connectionsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/islands`),
      axios.get(`${API_BASE_URL}/islands/connections`)
    ]);

    nodes.value.clear();
    nodes.value.add(islandsRes.data.map(island => ({
      id: island.id,
      label: island.name || `Остров ${island.id}`,
      x: island.x,
      y: island.y,
      monster_chance: island.monster_chance || 0,
      pirate_chance: island.pirate_chance || 0,
      patrol_chance: island.patrol_chance || 0,
      storm_chance: island.storm_chance || 0,
      has_harbor: island.has_harbor || false,
      color: getNodeColor(island)
    })));

    edges.value.clear();
    edges.value.add(connectionsRes.data.map(conn => ({
      id: conn.id,
      from: conn.from_island,
      to: conn.to_island,
      label: Math.round(conn.distance).toString(),
      length: conn.distance,
      width: 2,
      color: '#7FB3D5'
    })));
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    alert('Не удалось загрузить данные. Пожалуйста, проверьте консоль для подробностей.');
  }
};
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
}

const handleDoubleClick = (params) => {
  if (params.nodes.length === 1) {
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

// Алгоритмы поиска пути
const findOptimalPath = async () => {
  if (!startNode.value || !endNode.value) return

  try {
    const response = await axios.post(`${API_BASE_URL}/pathfinding`, {
      start: startNode.value,
      end: endNode.value,
      criteria: searchCriteria.value
    })
    
    path.value = response.data.path
    highlightPath()
  } catch (error) {
    console.error('Ошибка поиска пути:', error)
  }
}

const highlightPath = () => {
  // Сброс цветов
  nodes.value.update(nodes.value.get().map(node => ({
    id: node.id,
    color: getNodeColor(node)
  })))

  edges.value.update(edges.value.get().map(edge => ({
    id: edge.id,
    color: '#7FB3D5',
    width: 2
  })))

  // Подсветка пути
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

// Работа с узлами
const addNode = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/islands`, {
      name: `Остров ${nodes.value.length + 1}`,
      x: Math.floor(Math.random() * 800),
      y: Math.floor(Math.random() * 500),
      monster_chance: Math.floor(Math.random() * 100),
      pirate_chance: Math.floor(Math.random() * 100),
      patrol_chance: Math.floor(Math.random() * 100),
      storm_chance: Math.floor(Math.random() * 100),
      has_harbor: Math.random() > 0.7
    });
    
    const newIsland = response.data;
    nodes.value.add({
      id: newIsland.id,
      label: newIsland.name,
      x: newIsland.x,
      y: newIsland.y,
      ...newIsland,
      color: getNodeColor(newIsland)
    });
  } catch (error) {
    console.error('Ошибка добавления острова:', error);
    alert('Не удалось добавить остров. Пожалуйста, проверьте консоль для подробностей.');
  }
};

const updateNode = async () => {
  try {
    const response = await axios.put(`${API_BASE_URL}/islands/${selectedNode.value}`, nodeForm.value)
    const updatedIsland = response.data
    
    nodes.value.update({
      id: updatedIsland.id,
      label: updatedIsland.name,
      ...updatedIsland,
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
  network.value = new Network(
    container,
    { nodes: nodes.value, edges: edges.value },
    options
  )
  
  network.value.on('click', handleNodeClick)
  network.value.on('doubleClick', handleDoubleClick)
  network.value.on('dragEnd', async () => {
    const positions = network.value.getPositions()
    await Promise.all(Object.entries(positions).map(([id, pos]) => 
      axios.put(`${API_BASE_URL}/islands/${id}`, { x: pos.x, y: pos.y })
    ))
    if (path.value.length > 0) await findOptimalPath()
  })
  
  await loadData()
})
</script>

<template>
  <div class="p-4 h-full flex flex-col bg-blue-50">
    <!-- Заголовок и кнопки управления -->
    <div class="mb-4 p-4 bg-blue-800 text-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-2">Морские Пути Великого Путешествия</h1>
      <div class="flex flex-wrap gap-4 items-center">
        <button 
          @click="addNode"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
        >
          Добавить остров
        </button>
        
        <button 
          @click="resetSelection"
          class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
        >
          Сбросить выбор
        </button>
        
        <div class="flex items-center gap-2">
          <span class="text-sm">Старт:</span>
          <span class="px-2 py-1 bg-green-100 text-green-800 rounded">
            {{ startNode ? nodes.get(startNode).label : 'не выбран' }}
          </span>
          <span class="text-sm">Финиш:</span>
          <span class="px-2 py-1 bg-red-100 text-red-800 rounded">
            {{ endNode ? nodes.get(endNode).label : 'не выбран' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Критерии поиска -->
    <div class="mb-4 p-4 bg-white rounded-lg shadow-md border border-blue-200">
      <h3 class="text-lg font-bold mb-3 text-blue-800">Критерии поиска пути</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Дистанция ({{ searchCriteria.distance }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.distance" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Морские чудовища ({{ searchCriteria.monsterRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.monsterRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Пираты ({{ searchCriteria.pirateRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.pirateRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Морской дозор ({{ searchCriteria.patrolRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.patrolRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Штормы ({{ searchCriteria.stormRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.stormRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-cyan-200 rounded-lg appearance-none cursor-pointer">
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="preferHarbors" v-model="searchCriteria.preferHarbors" 
                 @change="findOptimalPath"
                 class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
          <label for="preferHarbors" class="ml-2 text-sm font-medium text-gray-700">Предпочитать порты</label>
        </div>
      </div>
    </div>

    <!-- Карта -->
    <div class="flex-1 relative">
      <div 
        class="network-container w-full h-full rounded-lg border-2 border-blue-300 bg-blue-100 shadow-inner"
        style="background-image: radial-gradient(circle at 1px 1px, #7FB3D5 1px, transparent 0);
               background-size: 20px 20px;"
      ></div>
      
      <!-- Легенда -->
      <div class="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border border-blue-200">
        <div class="flex items-center mb-2">
          <div class="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span class="text-sm">Обычный остров</span>
        </div>
        <div class="flex items-center mb-2">
          <div class="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span class="text-sm">Порт/убежище</span>
        </div>
        <div class="flex items-center mb-2">
          <div class="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span class="text-sm">Опасная зона</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <span class="text-sm">Очень опасно</span>
        </div>
      </div>
    </div>

    <!-- Статистика пути -->
    <div v-if="path.length > 0" class="mt-4 p-4 bg-white rounded-lg shadow-md border border-blue-200">
      <h3 class="text-lg font-bold mb-3 text-blue-800">Статистика маршрута</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-3 bg-blue-100 rounded-lg border border-blue-200">
          <div class="text-sm font-medium text-blue-800">Общая дистанция</div>
          <div class="text-xl font-bold">{{ pathStats.distance }}</div>
        </div>
        <div class="p-3 bg-purple-100 rounded-lg border border-purple-200">
          <div class="text-sm font-medium text-purple-800">Опасность чудовищ</div>
          <div class="text-xl font-bold">{{ pathStats.monsterRisk }}%</div>
        </div>
        <div class="p-3 bg-red-100 rounded-lg border border-red-200">
          <div class="text-sm font-medium text-red-800">Опасность пиратов</div>
          <div class="text-xl font-bold">{{ pathStats.pirateRisk }}%</div>
        </div>
        <div class="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
          <div class="text-sm font-medium text-yellow-800">Опасность патруля</div>
          <div class="text-xl font-bold">{{ pathStats.patrolRisk }}%</div>
        </div>
        <div class="p-3 bg-cyan-100 rounded-lg border border-cyan-200">
          <div class="text-sm font-medium text-cyan-800">Опасность шторма</div>
          <div class="text-xl font-bold">{{ pathStats.stormRisk }}%</div>
        </div>
        <div class="p-3 bg-green-100 rounded-lg border border-green-200">
          <div class="text-sm font-medium text-green-800">Порты на пути</div>
          <div class="text-xl font-bold">{{ pathStats.harborCount }}</div>
        </div>
        <div class="p-3 bg-orange-100 rounded-lg border border-orange-200">
          <div class="text-sm font-medium text-orange-800">Общий показатель опасности</div>
          <div class="text-xl font-bold">{{ pathStats.dangerScore }}</div>
        </div>
      </div>
    </div>

    <!-- Редактор узла -->
    <div v-if="showNodeEditor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 class="text-xl font-bold mb-4 text-blue-800">Редактирование острова</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input v-model="nodeForm.name" type="text" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Чудовища (%)</label>
              <input v-model.number="nodeForm.monster_chance" type="number" min="0" max="100"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Пираты (%)</label>
              <input v-model.number="nodeForm.pirate_chance" type="number" min="0" max="100"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Дозор (%)</label>
              <input v-model.number="nodeForm.patrol_chance" type="number" min="0" max="100"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Штормы (%)</label>
              <input v-model.number="nodeForm.storm_chance" type="number" min="0" max="100"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>
          </div>
          
          <div class="flex items-center">
            <input v-model="nodeForm.has_harbor" type="checkbox" 
                   class="h-4 w-4 text-blue-600 border-gray-300 rounded">
            <label class="ml-2 block text-sm text-gray-700">Есть порт/убежище</label>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button @click="showNodeEditor = false" 
                  class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
            Отмена
          </button>
          <button @click="updateNode" 
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <FooterMap />
  </div>
</template>

<style>
.network-container {
  background-image: radial-gradient(circle at 1px 1px, #7FB3D5 1px, transparent 0);
  background-size: 20px 20px;
}

/* Стили для ползунков */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
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