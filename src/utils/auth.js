// import jwt from 'jsonwebtoken';

// const JWT_SECRET = 'dnd_master_key'; // Замените на свой секретный ключ

// // Сохраняем токен при входе
// export const setAuthToken = (token) => {
//   localStorage.setItem('dnd_token', token);
// };

// // Проверяем авторизацию
// export const isAuthenticated = () => {
//   const token = localStorage.getItem('dnd_token');
//   if (!token) return false;
  
//   try {
//     return jwt.verify(token, JWT_SECRET);
//   } catch {
//     return false;
//   }
// };

// // Получаем данные пользователя из токена
// export const getUserData = () => {
//   const token = localStorage.getItem('dnd_token');
//   return jwt.decode(token);
// };

// // Выход
// export const logout = () => {
//   localStorage.removeItem('dnd_token');
//   window.location.reload();
// };