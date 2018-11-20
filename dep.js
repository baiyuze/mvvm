
class Dep {
  constructor() {
    //发布
    this.subs = [];
  }
  //订阅
  addSub(subs) {
    this.subs.push(subs);
  }
  // 通知
  notify() {
    this.subs.forEach((target, index) => {
      //通知watch函数更新数据
      target.update();
    })
  }
}
