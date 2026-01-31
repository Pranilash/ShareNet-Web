import { create } from 'zustand';
import api from '../lib/axios';

const useLostFoundStore = create((set, get) => ({
    posts: [],
    myPosts: [],
    isLoading: false,
    filter: { type: '', resolved: '' },

    setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),

    fetchPosts: async () => {
        set({ isLoading: true });
        try {
            const { filter } = get();
            const params = new URLSearchParams();
            if (filter.type) params.append('type', filter.type);
            if (filter.resolved !== '') params.append('resolved', filter.resolved);
            
            const response = await api.get(`/lost-found?${params.toString()}`);
            const data = response.data.data;
            set({ posts: data.posts || data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    fetchMyPosts: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/lost-found/my-posts');
            const data = response.data.data;
            set({ myPosts: data.posts || data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    createPost: async (formData) => {
        const response = await api.post('/lost-found', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        set({ myPosts: [...get().myPosts, response.data.data] });
        return response.data;
    },

    markResolved: async (id) => {
        const response = await api.patch(`/lost-found/${id}/resolve`);
        const updated = response.data.data;
        set({
            posts: get().posts.map(p => p._id === id ? updated : p),
            myPosts: get().myPosts.map(p => p._id === id ? updated : p)
        });
        return response.data;
    },

    deletePost: async (id) => {
        await api.delete(`/lost-found/${id}`);
        set({
            posts: get().posts.filter(p => p._id !== id),
            myPosts: get().myPosts.filter(p => p._id !== id)
        });
    }
}));

export default useLostFoundStore;
