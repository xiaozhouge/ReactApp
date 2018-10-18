import events from 'events'; //事件监控对象
let emitter = new events.EventEmitter();
emitter.setMaxListeners(50);
export default emitter