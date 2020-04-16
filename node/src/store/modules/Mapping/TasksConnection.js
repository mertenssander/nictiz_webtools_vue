import axios from 'axios'
import Vue from 'vue'
import _ from 'lodash'

const state = {
    loading: {
      'tasklist' : false,
      'details' : false,
      'comments' : false,
      'targets' : false,
      'dialog' : false,
      'search' : false,
    },
    tasks: [],
    selectedTask: false,
    selectedTaskComments: false,
    mappingTargets: false,
    searchResults: [],
    dialogData: {
      'component':{},
    },
  }

  //// ---- Mutations
  const mutations = {
    setTasks: (state, payload) => {
      state.tasks = payload
    },
    setTaskDetails: (state, payload) => {
      state.selectedTask = payload
    },
    setComments: (state, payload) => {
      state.selectedTaskComments = payload
    },
    setTargets: (state, payload) => {
      state.mappingTargets = payload
    },
    setSearchResults: (state, payload) => {
      state.searchResults = payload
    },
    setDialogData: (state, payload) => {
      state.dialogData = payload
    },
    resetDialogData: (state) => {
      state.dialogData = {'component':{}}
    },
  }

  //// ---- Actions
  const actions = {
    getTasks: (context, projectid) => {
      context.state.loading.tasklist = true
      axios
      .get(context.rootState.baseUrl+'mapping/api/1.0/tasklist/'+projectid+'/')
      .then((response) => {
          console.log(response.data)
          context.commit('setTasks',response.data)
          context.state.loading.tasklist = false
          return true;
      })
    },    
    getTaskDetails: (context, taskid) => {
      context.state.loading.details = true
      axios
      .get(context.rootState.baseUrl+'mapping/api/1.0/taskdetails/'+taskid+'/')
      .then((response) => {
          console.log(response.data)
          context.commit('setTaskDetails',response.data)
          context.state.loading.details = false
          return true;
      })
    },    
    getComments: (context, taskid) => {
      context.state.loading.comments = true
      axios
      .get(context.rootState.baseUrl+'mapping/api/1.0/events_and_comments/'+taskid+'/')
      .then((response) => {
          console.log(response.data)
          context.commit('setComments',response.data)
          context.state.loading.comments = false
          return true;
      })
    },
    getMappingTargets: (context, taskid) => {
      context.state.loading.targets = true
      axios
      .get(context.rootState.baseUrl+'mapping/api/1.0/mappings/'+taskid+'/')
      .then((response) => {
          console.log(response.data)
          context.commit('setTargets',response.data)
          context.state.loading.targets = false
          return true;
      })
    },
    getDialogData: (context, mappingid) => {
      context.state.loading.dialog = true
      axios
      .get(context.rootState.baseUrl+'mapping/api/1.0/mapping_dialog/'+mappingid+'/')
      .then((response) => {
          console.log(response.data)
          context.commit('setDialogData',response.data)
          context.state.loading.dialog = false
          return true;
      })
    },
    saveDialogData:(context, payload) => {
      const auth = {
        headers: {'X-CSRFToken' : Vue.$cookies.get('csrftoken')},
        withCredentials: true
      }
      axios
      .post(context.rootState.baseUrl+'mapping/api/1.0/mapping_dialog/', {
        'mapping' : context.state.dialogData,
        'task' : context.state.selectedTask.id,
        'new' : payload,
      },auth)
      .then(() => {
        context.dispatch('getMappingTargets',context.state.selectedTask.id)
        context.commit('resetDialogData')
        return true
        }
      )
    },
    postMappingTargets:(context, payload) => {
      const auth = {
        headers: {'X-CSRFToken' : Vue.$cookies.get('csrftoken')},
        withCredentials: true
      }
      axios
      .post(context.rootState.baseUrl+'mapping/api/1.0/mappings/', {
        'targets' : payload,
        'task' : context.state.selectedTask.id,
      },auth)
      .then(() => {
        context.dispatch('getMappingTargets',context.state.selectedTask.id)
        return true;
        }
      )
    },
    TargetSearch: _.debounce((context, payload) => {
        context.state.loading.search = true
        const auth = {
          headers: {'X-CSRFToken' : Vue.$cookies.get('csrftoken')},
          withCredentials: true
        }
        axios
        .post(context.rootState.baseUrl+'mapping/api/1.0/componentsearch/', {
          'query' : payload,
        },auth)
        .then((response) => {
          context.commit('setSearchResults',response.data)
          context.state.loading.search = false
          return true;
          }
        )
    }, 500),
    postComment:(context, payload) => {
      const auth = {
        headers: {'X-CSRFToken' : Vue.$cookies.get('csrftoken')},
        withCredentials: true
      }
      axios
      .post(context.rootState.baseUrl+'mapping/api/1.0/comments/', {
        'comment' : payload,
        'task' : context.state.selectedTask.id,
      },auth)
      .then(() => {
        context.dispatch('getComments',context.state.selectedTask.id)
        return true;
        }
      )
    },
    deleteComment: (context, payload) => {
      const auth = {
        headers: {'X-CSRFToken' : Vue.$cookies.get('csrftoken')},
        withCredentials: true
      }
      axios
      .delete(context.rootState.baseUrl+'mapping/api/1.0/comments/'+payload+'/', {},auth)
      .then(() => {
        context.dispatch('getComments',context.state.selectedTask.id)
        return true;
        }
      )
    },
    changeUser:(context, payload) => {
      const auth = {
        headers: {'X-CSRFToken' : Vue.$cookies.get('csrftoken')},
        withCredentials: true
      }
      axios
      .post(context.rootState.baseUrl+'mapping/api/1.0/users/', {
        'user' : payload,
        'task' : context.state.selectedTask.id,
      },auth)
      .then(() => {
        context.dispatch('getTaskDetails',context.state.selectedTask.id)
        context.dispatch('getTasks',context.state.selectedTask.project.id)
        context.dispatch('getComments',context.state.selectedTask.id)
        return true;
        }
      )
    },
    changeStatus:(context, payload) => {
      const auth = {
        headers: {'X-CSRFToken' : Vue.$cookies.get('csrftoken')},
        withCredentials: true
      }
      axios
      .post(context.rootState.baseUrl+'mapping/api/1.0/statuses/', {
        'status' : payload,
        'task' : context.state.selectedTask.id,
      },auth)
      .then(() => {
        context.dispatch('getTaskDetails',context.state.selectedTask.id)
        context.dispatch('getTasks',context.state.selectedTask.project.id)
        context.dispatch('getComments',context.state.selectedTask.id)
        return true;
        }
      )
    },
  }

export default {
    namespaced: true,
    state,
    // getters,
    actions,
    mutations
}