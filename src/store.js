// store.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    selectedDBItem: { label: 'Qwen-7b', value: 'null', description: '' },
    knowledgeBaseList: [
      { label: 'Qwen-7b', value: 'null', description: '' },  // 默认值为空
      // { label: '知识库1', value: 'kb1', description: '' },
      // { label: '知识库2', value: 'kb2', description: '' },
      // 其他知识库...
    ],
  },
  mutations: {
    setSelectedDBItem(state, item) {
      state.selectedDBItem = item;
    },
    setKnowledgeBaseList(state,item){
      state.knowledgeBaseList = item;
    }
  },
  actions: {
    updateSelectedDBItem({ commit }, item) {
      commit('setSelectedDBItem', item);
    },
    updateKnowledgeBaseListToCustom({ commit }, item) {
      commit('setKnowledgeBaseList', item);
    },
  },
});
