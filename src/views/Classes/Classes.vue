<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ImageButton from '@/components/UI/Button/ImageButton.vue'
import VisibilityToggle from '@/components/VisibilityToggle.vue'

const router = useRouter();
const classes = ref([]);

const fetchClasses = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/classes');
    classes.value = data.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
    console.error('Ошибка при загрузке классов:', err);
    alert('Не удалось загрузить классы');
  }
};

const goToClass = (id) => {
  router.push(`/classes/${id}`);
};

const addNewClass = () => {
  router.push('/classes/new'); 
};

onMounted(fetchClasses);
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-white font-bold text-5xl m-10">Классы</h1>
    <div class="container mx-auto p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <VisibilityToggle
          v-for="clss in classes"
          :key="clss.id"
          :content-id="`clss-${clss.id}`"
          content-type="clss"
        >
          <ImageButton 
            :image="clss.image_path"
            :text="clss.name"
            :objectPosition="clss.image_position"
            @click="goToClass(clss.id)"
            class="h-full"
          />
        </VisibilityToggle>
    </div>
  </div>
  </div>

 
</template>


