<template>
  <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
    <h3 class="text-lg font-bold mb-2 text-blue-800">Как пользоваться картой</h3>
    <ul class="space-y-1 text-sm text-gray-700">
      <li class="flex items-start">
        <span class="text-green-600 mr-2">•</span>
        <span>Кликните по острову, чтобы выбрать стартовую точку (зелёный)</span>
      </li>
      <li class="flex items-start">
        <span class="text-red-600 mr-2">•</span>
        <span>Кликните по другому острову, чтобы выбрать финиш (красный)</span>
      </li>
      <li class="flex items-start">
        <span class="text-blue-600 mr-2">•</span>
        <span>Перетаскивайте острова для изменения карты</span>
      </li>
      <li class="flex items-start">
        <span class="text-yellow-600 mr-2">•</span>
        <span>Двойной клик по острову открывает редактор</span>
      </li>
      <li class="flex items-start">
        <span class="text-purple-600 mr-2">•</span>
        <span>Путь автоматически пересчитывается при изменениях</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
li {
  line-height: 1.5;
}
</style>