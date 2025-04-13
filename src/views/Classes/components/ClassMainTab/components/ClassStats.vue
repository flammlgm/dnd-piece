<script setup>
defineProps({
  classData: Object
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
    <div>
      <h3 class="text-2xl font-bold mb-4">Основные характеристики:</h3>
      <p class="mb-2"><b>Кость хитов:</b> 1к{{ classData.hit_dice }} за каждый уровень</p>
      <p class="mb-2"><b>Хиты на 1 уровне:</b> {{ classData.hit_dice }} (или {{ Math.floor(classData.hit_dice/2) + 1 }}) + ваш модификатор <b>Телосложения</b></p>
      <p><b>Базовая характеристика:</b> {{ classData.base_stats }}</p>
    </div>
  </div>
</template>