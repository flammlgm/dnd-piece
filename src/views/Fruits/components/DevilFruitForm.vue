<script setup>
import InputField from '@/components/UI/Inputs/InputField.vue';
import { CaseSensitive, X, Save, ALargeSmall, Plus, Trash } from 'lucide-vue-next';
import IconButton from '@/components/UI/Button/IconButton.vue';
import { ref, watch, nextTick } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  fruit: Object,
  fruitTypes: Array,
  rarityTypes: Array,
  mode: String
});

const emit = defineEmits(['save', 'cancel']);

// Создаем глубокую реактивную копию фрукта
const localFruit = ref(JSON.parse(JSON.stringify(props.fruit)));

// Генерируем уникальные ключи для способностей
const featureKeys = ref(new Map());

// Инициализируем creature если его нет
if (!localFruit.value.creature && localFruit.value.type === 'Zoan') {
  localFruit.value.creature = getDefaultCreature();
}

// Инициализируем abilities если их нет
if (!localFruit.value.abilities) {
  localFruit.value.abilities = {
    rarity: 'Uncommon',
    features: [],
    awakening: null
  };
}

// Инициализируем ключи для существующих способностей
if (localFruit.value.abilities.features) {
  localFruit.value.abilities.features.forEach((feature, index) => {
    featureKeys.value.set(index, generateKey());
  });
}

// Функция для создания дефолтного существа
function getDefaultCreature() {
  return {
    name: '',
    type: 'beast',
    size: 'Medium',
    ac: 10,
    hp: '1d10',
    speed: '30 ft',
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    skills: '',
    abilities: []
  };
}

// Генерация уникального ключа
function generateKey() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Обработчик изменения типа
watch(() => localFruit.value.type, (newType) => {
  if (newType === 'Zoan' && !localFruit.value.creature) {
    localFruit.value.creature = getDefaultCreature();
  } else if (newType !== 'Zoan') {
    localFruit.value.creature = null;
  }
});

const addFeature = async () => {
  if (!localFruit.value.abilities.features) {
    localFruit.value.abilities.features = [];
  }
  
  const newIndex = localFruit.value.abilities.features.length;
  localFruit.value.abilities.features.push({
    name: `Способность ${newIndex + 1}`,
    description: ''
  });
  
  // Генерируем и сохраняем ключ для новой способности
  featureKeys.value.set(newIndex, generateKey());
  
  // Ждем обновления DOM перед фокусировкой
  await nextTick();
  const inputs = document.querySelectorAll('.feature-name-input');
  if (inputs.length > 0) {
    const lastInput = inputs[inputs.length - 1];
    lastInput.focus();
    // Прокручиваем к новому полю ввода
    lastInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

const removeFeature = (index) => {
  localFruit.value.abilities.features.splice(index, 1);
  // Удаляем ключ для удаленной способности
  featureKeys.value.delete(index);
};

const updateFeatureOrders = () => {
  localFruit.value.abilities.features.forEach((f, idx) => {
    f.order = idx;
  });
};

// Методы для безопасного обновления creature
const updateCreatureField = (field, value) => {
  if (!localFruit.value.creature) {
    localFruit.value.creature = getDefaultCreature();
  }
  localFruit.value.creature[field] = value;
};

const updateCreatureStat = (stat, value) => {
  if (!localFruit.value.creature) {
    localFruit.value.creature = getDefaultCreature();
  }
  if (!localFruit.value.creature.stats) {
    localFruit.value.creature.stats = {};
  }
  localFruit.value.creature.stats[stat] = Number(value) || 0;
};
</script>

<template>
  <div class="mb-6 p-4 bg-gray-700/50 rounded-lg">
    <h3 class="text-lg font-bold mb-3">{{ mode === 'create' ? 'Новый фрукт' : 'Редактирование фрукта' }}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Основные поля -->
      <div>
        <label class="block mb-2">Название</label>
        <InputField 
          v-model="localFruit.name"
          placeholder="Название фрукта"
          :icon="CaseSensitive"/>
      </div>
      
      <div>
        <label class="block mb-1">Тип</label>
        <select v-model="localFruit.type" class="w-full p-2 bg-gray-700 rounded">
          <option v-for="type in fruitTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <div>
        <label class="block mb-1">Редкость</label>
        <select v-model="localFruit.abilities.rarity" class="w-full p-2 bg-gray-700 rounded">
          <option v-for="rarity in rarityTypes" :key="rarity" :value="rarity">{{ rarity }}</option>
        </select>
      </div>

      <div class="flex items-center col-span-2">
        <input type="checkbox" id="water_vulnerability" v-model="localFruit.water_vulnerability" class="mr-2">
        <label for="water_vulnerability">Уязвимость к воде</label>
      </div>
      
      <div class="col-span-2">
        <label class="block mb-2">Описание</label>
        <textarea
          v-model="localFruit.description"
          class="w-full h-32 p-2 bg-gray-700 rounded"
          placeholder="Описание фрукта..."
        ></textarea>
      </div>
      
      <div class="col-span-2">
        <label class="block mb-2">Внешний вид</label>
        <textarea
          v-model="localFruit.appearance"
          class="w-full h-32 p-2 bg-gray-700 rounded"
          placeholder="Описание внешнего вида..."
        ></textarea>
      </div>

      <!-- Способности -->
      <div class="col-span-2">
        <div class="flex justify-between items-center mb-2">
          <label class="block">Способности</label>
          <IconButton @click="addFeature" title="Добавить способность">
            <Plus class="w-5 h-5"/>
          </IconButton>
        </div>
        
        <draggable 
          v-model="localFruit.abilities.features"
          item-key="index"
          @end="updateFeatureOrders"
          handle=".drag-handle"
        >
          <template #item="{element, index}">
            <div class="mb-4 border border-gray-600 rounded p-3" :key="featureKeys.get(index)">
              <div class="flex items-center gap-2 mb-2">
                <button class="drag-handle cursor-grab">☰</button>
                <InputField
                  v-model="element.name"
                  placeholder="Название способности"
                  class="flex-1 feature-name-input"
                  :icon="ALargeSmall"
                />
                <IconButton @click="removeFeature(index)" title="Удалить">
                  <Trash class="w-4 h-4"/>
                </IconButton>
              </div>
              <textarea
                v-model="element.description"
                class="w-full h-20 p-2 bg-gray-700 rounded"
                placeholder="Описание способности..."
              ></textarea>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Поля для Zoan -->
      <template v-if="localFruit.type === 'Zoan' && localFruit.creature">
        <div class="col-span-2 mt-4">
          <h4 class="font-bold mb-2">Форма существа</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block mb-1">Название существа</label>
              <input 
                :value="localFruit.creature.name" 
                @input="updateCreatureField('name', $event.target.value)"
                class="w-full p-2 bg-gray-700 rounded">
            </div>
            <div>
              <label class="block mb-1">Тип существа</label>
              <input 
                :value="localFruit.creature.type" 
                @input="updateCreatureField('type', $event.target.value)"
                class="w-full p-2 bg-gray-700 rounded">
            </div>
            <div>
              <label class="block mb-1">Размер</label>
              <select 
                :value="localFruit.creature.size" 
                @change="updateCreatureField('size', $event.target.value)"
                class="w-full p-2 bg-gray-700 rounded">
                <option value="Tiny">Крошечный</option>
                <option value="Small">Маленький</option>
                <option value="Medium">Средний</option>
                <option value="Large">Большой</option>
                <option value="Huge">Огромный</option>
                <option value="Gargantuan">Гигантский</option>
              </select>
            </div>
            <div>
              <label class="block mb-1">КД</label>
              <input 
                :value="localFruit.creature.ac" 
                @input="updateCreatureField('ac', $event.target.value)"
                type="number" 
                class="w-full p-2 bg-gray-700 rounded">
            </div>
            <div>
              <label class="block mb-1">Хиты</label>
              <input 
                :value="localFruit.creature.hp" 
                @input="updateCreatureField('hp', $event.target.value)"
                class="w-full p-2 bg-gray-700 rounded">
            </div>
            <div>
              <label class="block mb-1">Скорость</label>
              <input 
                :value="localFruit.creature.speed" 
                @input="updateCreatureField('speed', $event.target.value)"
                class="w-full p-2 bg-gray-700 rounded">
            </div>
          </div>

          <h5 class="font-bold mt-4 mb-2">Характеристики</h5>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div v-for="stat in ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']" :key="stat">
              <label class="block mb-1 capitalize">{{ stat }}</label>
              <input 
                :value="localFruit.creature.stats[stat]" 
                @input="updateCreatureStat(stat, $event.target.value)"
                type="number" 
                class="w-full p-2 bg-gray-700 rounded">
            </div>
          </div>

          <div class="mt-4">
            <label class="block mb-1">Владения</label>
            <input 
              :value="localFruit.creature.skills" 
              @input="updateCreatureField('skills', $event.target.value)"
              class="w-full p-2 bg-gray-700 rounded">
          </div>

          <div class="mt-4">
            <label class="block mb-2">Способности существа</label>
            <textarea
              :value="localFruit.creature.abilities" 
              @input="updateCreatureField('abilities', $event.target.value)"
              class="w-full h-32 p-2 bg-gray-700 rounded"
              placeholder="Описание способностей существа..."
            ></textarea>
          </div>
        </div>
      </template>
    </div>
    
    <div class="flex justify-end gap-2 mt-4">
      <IconButton @click="$emit('cancel')" title="Отменить">
        <X class="w-5 h-5"/>
      </IconButton>
      <IconButton @click="$emit('save', localFruit)" title="Сохранить">
        <Save class="w-5 h-5"/>
      </IconButton>
    </div>
  </div>
</template>

<style scoped>
.drag-handle {
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0 8px;
}
.drag-handle:hover {
  opacity: 1;
  cursor: grab;
}
</style>