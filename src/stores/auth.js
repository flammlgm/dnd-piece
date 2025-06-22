import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const router = useRouter();

  const setAuth = (userData, authToken) => {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const clearAuth = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const register = async (username, password, role) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password,
        role
      });
      setAuth(response.data, response.data.token);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      clearAuth();
      throw error.response?.data?.error || 'Registration failed';
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Attempting login with:', username);
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Login response:', response.data);
      setAuth(response.data, response.data.token);
      return response.data;
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      clearAuth();
      throw error.response?.data?.error || error.message || 'Login failed';
    }
  };

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  const checkAuth = async () => {
    if (token.value) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        const response = await axios.get('http://localhost:5000/api/auth/me');
        user.value = response.data;
        return true;
      } catch (error) {
        console.error('Auth check error:', error.response?.data || error.message);
        clearAuth();
        return false;
      }
    }
    return false;
  };

  return {
    user,
    token,
    register,
    login,
    logout,
    checkAuth,
    setAuth,
    clearAuth
  };
});