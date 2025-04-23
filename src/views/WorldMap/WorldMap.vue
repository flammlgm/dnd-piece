<script setup>
import { ref, onMounted, computed } from 'vue'
import { DataSet } from 'vis-data'
import { Network } from 'vis-network'
import axios from 'axios'
import FooterMap from './components/FooterMap.vue'

// Базовый URL API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Реактивные данные
const MAX_CONNECTION_DISTANCE = 300;
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
    size: 5,
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
      x: false,
      y: false
    },  
    font: {
      size: 10,
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
    enabled: false,
    stabilization: {
      fit: true,
      iterations: 1000
    }
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
    multiselect: false,
    selectConnectedEdges: false
  },
  // Добавьте эти настройки:
  layout: {
    randomSeed: undefined,
    improvedLayout: true
  },
  configure: {
    enabled: false
  },
  width: '100%',
  height: '100%'
}

// Загрузка данных
const loadData = async () => {
  try {
    const [islandsRes, connectionsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/islands`),
      axios.get(`${API_BASE_URL}/islands/connections`)
    ]);

    nodes.value.add(islandsRes.data.map(island => {
      // Проверяем и корректируем координаты
      const x = Math.max(0, Math.min(1400, island.x || 0));
      const y = Math.max(0, Math.min(900, island.y || 0));
      
      return {
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
    };
  }));

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
    const x = Math.floor(Math.random() * 1400);
    const y = Math.floor(Math.random() * 900);
    
    const response = await axios.post(`${API_BASE_URL}/islands`, {
      name: `Остров ${nodes.value.length + 1}`,
      x,
      y,
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
    
    // Автоматически создаем связи для нового острова
    await updateConnectionsForIsland(newIsland.id, newIsland.x, newIsland.y);
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
  try {
    const positions = network.value.getPositions();
    const updates = Object.entries(positions).map(async ([id, pos]) => {
      // Ограничиваем координаты
      const x = Math.max(0, Math.min(1400, pos.x));
      const y = Math.max(0, Math.min(900, pos.y));
      
      try {
        // Обновляем позицию острова в БД
        await axios.put(`${API_BASE_URL}/islands/${id}`, { x, y });
        
        // Обновляем позицию в локальном хранилище
        nodes.value.update({ id: parseInt(id), x, y });
        
        // Обновляем связи для этого острова
        await updateConnectionsForIsland(id, x, y);
      } catch (error) {
        console.error('Ошибка обновления острова:', id, error);
      }
    });

    await Promise.all(updates);
    if (path.value.length > 0) await findOptimalPath();
  } catch (error) {
    console.error('Ошибка в обработчике dragEnd:', error);
  }
});
  
  await loadData()
})

const updateConnectionsForIsland = async (islandId, x, y) => {
  try {
    // Получаем все острова
    const allIslands = nodes.value.get();
    
    // Находим острова в пределах MAX_CONNECTION_DISTANCE
    const nearbyIslands = allIslands.filter(island => {
      if (island.id === parseInt(islandId)) return false;
      
      const dx = x - island.x;
      const dy = y - island.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= MAX_CONNECTION_DISTANCE;
    });
    
    // Получаем текущие связи для этого острова
    const currentConnections = edges.value.get().filter(edge => 
      edge.from === parseInt(islandId) || edge.to === parseInt(islandId)
    );
    
    // Определяем, какие связи нужно добавить
    const connectionsToAdd = nearbyIslands.filter(island => {
      return !currentConnections.some(conn => 
        (conn.from === parseInt(islandId) && conn.to === island.id) ||
        (conn.to === parseInt(islandId) && conn.from === island.id)
      );
    });
    
    // Добавляем новые связи
    for (const island of connectionsToAdd) {
      const dx = x - island.x;
      const dy = y - island.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/islands/connections`, {
          from_island: parseInt(islandId),
          to_island: island.id,
          distance: parseFloat(distance.toFixed(2))
        });
        
        edges.value.add({
          id: response.data.id,
          from: response.data.from_island,
          to: response.data.to_island,
          label: Math.round(response.data.distance).toString(),
          length: response.data.distance,
          width: 2,
          color: '#7FB3D5'
        });
      } catch (error) {
        console.error('Ошибка создания связи:', error);
      }
    }
    
    // Определяем, какие связи нужно удалить (если острова разошлись)
    const connectionsToRemove = currentConnections.filter(conn => {
      const otherIslandId = conn.from === parseInt(islandId) ? conn.to : conn.from;
      const otherIsland = allIslands.find(i => i.id === otherIslandId);
      
      if (!otherIsland) return true;
      
      const dx = x - otherIsland.x;
      const dy = y - otherIsland.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance > MAX_CONNECTION_DISTANCE;
    });
    
    // Удаляем старые связи
    for (const conn of connectionsToRemove) {
      try {
        await axios.delete(`${API_BASE_URL}/islands/connections/${conn.id}`);
        edges.value.remove(conn.id);
      } catch (error) {
        console.error('Ошибка удаления связи:', error);
      }
    }
    
    // Обновляем расстояния для оставшихся связей
    const connectionsToUpdate = currentConnections.filter(conn => 
      !connectionsToRemove.some(c => c.id === conn.id)
    );
    
    for (const conn of connectionsToUpdate) {
      const otherIslandId = conn.from === parseInt(islandId) ? conn.to : conn.from;
      const otherIsland = allIslands.find(i => i.id === otherIslandId);
      
      if (otherIsland) {
        const dx = x - otherIsland.x;
        const dy = y - otherIsland.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        try {
          await axios.put(`${API_BASE_URL}/islands/connections/${conn.id}`, {
            distance: parseFloat(distance.toFixed(2))
          });
          
          edges.value.update({
            id: conn.id,
            label: Math.round(distance).toString(),
            length: distance
          });
        } catch (error) {
          console.error('Ошибка обновления связи:', error);
        }
      }
    }
  } catch (error) {
    console.error('Ошибка обновления связей:', error);
  }
};

</script>

<template>
  <div class="world-map-page bg-gray-900 text-white font-mono min-h-screen p-6">
    <!-- Заголовок и кнопки управления -->
    <div class="mb-6 p-6 bg-gray-800 rounded-2xl shadow-lg">
      <h1 class="text-4xl font-bold mb-4">Морские Пути Великого Путешествия</h1>
      <div class="flex flex-wrap gap-4 items-center">
        <button 
          @click="addNode"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium"
        >
          Добавить остров
        </button>
        
        <button 
          @click="resetSelection"
          class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition font-medium"
        >
          Сбросить выбор
        </button>
        
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

    <!-- Критерии поиска -->
    <div class="mb-6 p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
      <h3 class="text-xl font-bold mb-4 text-blue-400">Критерии поиска пути</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Дистанция ({{ searchCriteria.distance }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.distance" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-blue-600 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Морские чудовища ({{ searchCriteria.monsterRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.monsterRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-purple-600 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Пираты ({{ searchCriteria.pirateRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.pirateRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-red-600 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Морской дозор ({{ searchCriteria.patrolRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.patrolRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-yellow-600 rounded-lg appearance-none cursor-pointer">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Штормы ({{ searchCriteria.stormRisk }}%)</label>
          <input type="range" min="0" max="100" v-model="searchCriteria.stormRisk" 
                 @change="findOptimalPath"
                 class="w-full h-2 bg-cyan-600 rounded-lg appearance-none cursor-pointer">
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="preferHarbors" v-model="searchCriteria.preferHarbors" 
                 @change="findOptimalPath"
                 class="w-5 h-5 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500">
          <label for="preferHarbors" class="ml-3 text-sm font-medium text-gray-300">Предпочитать порты</label>
        </div>
      </div>
    </div>

    <!-- Карта -->
    <div class="flex-1 relative h-full">
  <div 
    class="network-container w-full rounded-2xl border-2 border-gray-700 bg-gray-900 shadow-lg"
    style="background-image: radial-gradient(circle at 1px 1px, #4B5563 1px, transparent 0);
           background-size: 40px 40px;"
  ></div>
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
    <div v-if="showNodeEditor" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-700">
        <h3 class="text-2xl font-bold mb-6 text-blue-400">Редактирование острова</h3>
        
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Название</label>
            <input v-model="nodeForm.name" type="text" 
                   class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Чудовища (%)</label>
              <input v-model.number="nodeForm.monster_chance" type="number" min="0" max="100"
                     class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Пираты (%)</label>
              <input v-model.number="nodeForm.pirate_chance" type="number" min="0" max="100"
                     class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Дозор (%)</label>
              <input v-model.number="nodeForm.patrol_chance" type="number" min="0" max="100"
                     class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Штормы (%)</label>
              <input v-model.number="nodeForm.storm_chance" type="number" min="0" max="100"
                     class="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
          
          <div class="flex items-center">
            <input v-model="nodeForm.has_harbor" type="checkbox" 
                   class="w-5 h-5 text-blue-600 border-gray-600 bg-gray-700 rounded focus:ring-blue-500">
            <label class="ml-3 block text-sm text-gray-300">Есть порт/убежище</label>
          </div>
        </div>
        
        <div class="mt-8 flex justify-end space-x-4">
          <button @click="showNodeEditor = false" 
                  class="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition font-medium">
            Отмена
          </button>
          <button @click="updateNode" 
                  class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition font-medium">
            Сохранить
          </button>
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