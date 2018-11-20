export default {
    install(Vue, options){
        Vue.prototype.$storex = function (options) {
            console.log('my test plugin.')
        }
    }
}