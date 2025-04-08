<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const classId = ref(route.params.id);
const name = ref('');
const description = ref('');
const hitDice = ref('');
const parentClassId = ref(null);
const isSubclass = ref(false);

const fetchClass = async () => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/classes/${classId.value}`);
    name.value = data.name;
    description.value = data.description;
    hitDice.value = data.hit_dice;
    parentClassId.value = data.parent_class_id;
    isSubclass.value = data.is_subclass;
  } catch (err) {
    console.error('Ошибка при загрузке класса:', err);
  }
};

const updateClass = async () => {
  try {
    const updatedClass = {
      name: name.value,
      description: description.value,
      hit_dice: hitDice.value,
      parent_class_id: parentClassId.value,
      is_subclass: isSubclass.value
    };
    await axios.put(`http://localhost:5000/api/classes/${classId.value}`, updatedClass);
    alert('Класс успешно обновлён!');
    router.push('/classes'); // Переход на страницу классов после обновления
  } catch (err) {
    console.error('Ошибка при обновлении класса:', err);
    alert('Ошибка при обновлении класса');
  }
};

onMounted(fetchClass);
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Редактировать класс</h1>
    <form @submit.prevent="updateClass" class="space-y-4">
      <div>
        <label for="name" class="block">Название класса</label>
        <input id="name" v-model="name" type="text" class="border p-2 w-full" required />
      </div>
      <div>
        <label for="description" class="block">Описание</label>
        <input id="description" v-model="description" type="text" class="border p-2 w-full" required />
      </div>
      <div>
        <label for="hitDice" class="block">Кость хитов</label>
        <input id="hitDice" v-model="hitDice" type="text" class="border p-2 w-full" required />
      </div>
      <div>
        <label for="parentClassId" class="block">ID родительского класса (если есть)</label>
        <input id="parentClassId" v-model="parentClassId" type="number" class="border p-2 w-full" />
      </div>
      <div>
        <label for="isSubclass" class="block">Это подкласс?</label>
        <input id="isSubclass" v-model="isSubclass" type="checkbox" />
      </div>
      <div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2">Обновить</button>
      </div>
    </form>
  </div>
</template>
