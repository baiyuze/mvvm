class Watch {
  constructor(vm, exp, fn) {
    this.vm = vm;
    this.exp = exp;
    this.fn = fn;
    Dep.target = this;
  }

  // 更新
  update(callback) {
    let val = this.vm;
    let exp = this.exp;
    let vm = this.vm;
    let arr = exp.split('.');//['a', 'b'];
    //重新赋值
    arr.forEach((key) => {
      val = val[key]; //{a: {b: 1} }
    });
    //val = 1; //重复赋值
    this.fn(val);

  }


}
