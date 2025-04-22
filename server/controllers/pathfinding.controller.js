import pool from '../config/db.js'

export const findPath = async (req, res) => {
  try {
    const { start, end, criteria } = req.body
    
    // 1. Получаем все узлы и связи
    const { rows: islands } = await pool.query('SELECT * FROM islands')
    const { rows: connections } = await pool.query('SELECT * FROM island_connections')
    
    // 2. Преобразуем в граф
    const graph = {}
    islands.forEach(island => {
      graph[island.id] = {
        ...island,
        edges: []
      }
    })
    
    connections.forEach(conn => {
      graph[conn.from_island].edges.push({
        to: conn.to_island,
        distance: conn.distance
      })
      graph[conn.to_island].edges.push({
        to: conn.from_island,
        distance: conn.distance
      })
    })
    
    // 3. Реализация алгоритма поиска пути с учётом критериев
    const path = findOptimalPath(graph, start, end, criteria)
    
    res.json({ path })
  } catch (error) {
    console.error('Pathfinding error:', error)
    res.status(500).json({ error: 'Ошибка поиска пути' })
  }
}

function findOptimalPath(graph, start, end, criteria) {
  // Приоритетная очередь
  const queue = new PriorityQueue()
  queue.enqueue(start, 0)
  
  // Храним откуда пришли
  const cameFrom = { [start]: null }
  
  // Стоимость пути до каждой точки
  const costSoFar = { [start]: 0 }
  
  while (!queue.isEmpty()) {
    const current = queue.dequeue().element
    
    // Если дошли до цели
    if (current === end) break
    
    // Проверяем всех соседей
    for (const edge of graph[current].edges) {
      const neighbor = edge.to
      const newCost = costSoFar[current] + calculateEdgeCost(graph, current, neighbor, edge.distance, criteria)
      
      // Если нашли более оптимальный путь
      if (!(neighbor in costSoFar) || newCost < costSoFar[neighbor]) {
        costSoFar[neighbor] = newCost
        const priority = newCost + heuristic(graph, neighbor, end, criteria)
        queue.enqueue(neighbor, priority)
        cameFrom[neighbor] = current
      }
    }
  }
  
  // Восстанавливаем путь
  return reconstructPath(cameFrom, start, end)
}

function calculateEdgeCost(graph, from, to, distance, criteria) {
  const fromNode = graph[from]
  const toNode = graph[to]
  
  // Базовый вес - расстояние
  let cost = distance * (criteria.distance / 100)
  
  // Добавляем риски узлов (усредняем)
  const avgMonsterRisk = (fromNode.monster_chance + toNode.monster_chance) / 2
  const avgPirateRisk = (fromNode.pirate_chance + toNode.pirate_chance) / 2
  const avgPatrolRisk = (fromNode.patrol_chance + toNode.patrol_chance) / 2
  const avgStormRisk = (fromNode.storm_chance + toNode.storm_chance) / 2
  
  cost += avgMonsterRisk * (criteria.monsterRisk / 100)
  cost += avgPirateRisk * (criteria.pirateRisk / 100)
  cost += avgPatrolRisk * (criteria.patrolRisk / 100)
  cost += avgStormRisk * (criteria.stormRisk / 100)
  
  // Бонус за порты
  if (criteria.preferHarbors) {
    if (fromNode.has_harbor) cost *= 0.9
    if (toNode.has_harbor) cost *= 0.9
  }
  
  return cost
}

function heuristic(graph, a, b, criteria) {
  // Простая эвристика - расстояние между точками
  const nodeA = graph[a]
  const nodeB = graph[b]
  const dx = nodeA.x - nodeB.x
  const dy = nodeA.y - nodeB.y
  return Math.sqrt(dx * dx + dy * dy) * (criteria.distance / 100)
}

function reconstructPath(cameFrom, start, end) {
  const path = []
  let current = end
  
  while (current !== start) {
    path.unshift(current)
    current = cameFrom[current]
    if (current === null) return [] // путь не найден
  }
  
  path.unshift(start)
  return path
}

// Простая реализация очереди с приоритетом
class PriorityQueue {
  constructor() {
    this.items = []
  }
  
  enqueue(element, priority) {
    const item = { element, priority }
    let added = false
    
    for (let i = 0; i < this.items.length; i++) {
      if (item.priority < this.items[i].priority) {
        this.items.splice(i, 0, item)
        added = true
        break
      }
    }
    
    if (!added) {
      this.items.push(item)
    }
  }
  
  dequeue() {
    return this.items.shift()
  }
  
  isEmpty() {
    return this.items.length === 0
  }
}