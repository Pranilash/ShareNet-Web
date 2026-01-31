import { create } from 'zustand';
import api from '../lib/axios';

const useRequestStore = create((set, get) => ({
    myRequests: [],
    receivedRequests: [],
    activeRequests: [],
    isLoading: false,

    fetchMyRequests: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/requests/my-requests');
            const data = response.data.data;
            set({ myRequests: data.requests || data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    fetchReceivedRequests: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/requests/received');
            const data = response.data.data;
            set({ receivedRequests: data.requests || data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    fetchActiveRequests: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/requests/active');
            const data = response.data.data;
            set({ activeRequests: data.requests || data, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    createRequest: async (data) => {
        let response;
        if (data instanceof FormData) {
            response = await api.post('/requests', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            response = await api.post('/requests', data);
        }
        set({ myRequests: [...get().myRequests, response.data.data] });
        return response.data;
    },

    acceptRequest: async (id) => {
        const response = await api.post(`/requests/${id}/accept`);
        set({
            receivedRequests: get().receivedRequests.map(req => 
                req._id === id ? { ...req, status: 'ACCEPTED' } : req
            )
        });
        return response.data;
    },

    rejectRequest: async (id) => {
        const response = await api.post(`/requests/${id}/reject`);
        set({
            receivedRequests: get().receivedRequests.map(req => 
                req._id === id ? { ...req, status: 'REJECTED' } : req
            )
        });
        return response.data;
    },

    cancelRequest: async (id) => {
        const response = await api.post(`/requests/${id}/cancel`);
        set({
            myRequests: get().myRequests.map(req => 
                req._id === id ? { ...req, status: 'CANCELLED' } : req
            )
        });
        return response.data;
    }
}));

export default useRequestStore;
