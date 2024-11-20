// store.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    selectedDBItem: { label: 'Qwen-7b', value: 'null', description: '' },
  },
  mutations: {
    setSelectedDBItem(state, item) {
      state.selectedDBItem = item;
    },
  },
  actions: {
    updateSelectedDBItem({ commit }, item) {
      commit('setSelectedDBItem', item);
    },
  },
});
