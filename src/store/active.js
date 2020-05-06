import {groupList, couponsList, recentActive} from '@/const/api'
export const state = () => ({
  nowActive: {
    // name: '2019春秋装新款圆领套头白色cec卫衣女潮ins上衣韩版宽松短款高腰',
    // id: '6c5121222fdc35314be10cb39ea21360',
    // name: '',
    // id: ''
  },
  groupList: [],
  couponList: []
})

export const mutations = {
  setNowActive(state, activeData) {
    state.nowActive = activeData
  },
  setGroupList(state, activeData) {
    state.groupList = activeData
  }
}

export const actions = {
  async getGroupList({state, commit, rootState}) {
    if (state.groupList && Object.keys(state.groupList).length) {
      return state.groupList
    }
    try {
      const resp = await this.$axios.$get(groupList)

      if (resp.payload) {
        commit('setGroupList', resp.payload)
      }

      return resp.payload
    } catch (e) {
      console.error(e)
      return e
    }
  },
  async getCouponList({state, commit, rootState}) {
    if (state.couponList && Object.keys(state.couponList).length) {
      return state.couponList
    }
    try {
      const resp = await this.$axios.$get(couponList)

      if (resp.payload) {
        commit('setCouponList', resp.payload)
      }

      return resp.payload
    } catch (e) {
      console.error(e)
      return e
    }
  },
  //待接入
  async getNowActive({state, commit, rootState}) {
    if (state.nowActive && Object.keys(state.nowActive).length) {
      return state.nowActive
    }
    try {
      const resp = await this.$axios.$get(recentActive)

      if (resp.payload) {
        commit('setNowActive', resp.payload || {})
      }

      return resp.payload
    } catch (e) {
      console.error(e)
      return e
    }
  }
}
