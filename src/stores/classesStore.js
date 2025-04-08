import { defineStore } from 'pinia';
import axios from 'axios';

export const useClassesStore = defineStore('classes', {
  state: () => ({
    classes: [],  // Здесь будут храниться все классы
  }),
  actions: {
    async fetchClasses() {
      try {
        const response = await axios.get('http://localhost:5000/api/classes');
        this.classes = response.data;  // Сохраняем данные в состояние
      } catch (error) {
        console.error('Ошибка при загрузке классов:', error);
      }
    },
    findClassById(id) {
      console.log(`Поиск класса с ID: ${id}`);
      return this.classes.find(cls => cls.id === id);
    }
  }
});
