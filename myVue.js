

// //从头写一个mvvm的框架
class MyVue {
  constructor(option) {
    this.init(option);
    //所有数据都通过this._data获取
    let data = this._data;
    this.dep = new Dep();
    // 劫持数据
    this.observe(data)
    this._proxyData(data);
    //编译HTML
    this.Compile();

  }

  //初始化参数
  init(option) {
    this.$option = option;
    this._data = this.$option.data;
  }

  _proxyData(data) {
    for(let key in data) {
      Object.defineProperty(this, key, {
        enumerable: true,//可以进行枚举
        get: () => {
          return this._data[key];
        },
        set: (newval) => {
          this._data[key] = newval;
        }
      });
    }
  }

  //只给引用类型添加监听
  observe(data) {
    if(typeof data !== 'object') return;
    return this.Observe(data);
  }

  //编译
  Compile() {
    this.$el = document.querySelector(this.$option.el);
    //创建文档碎片，不会造成回流具体查看mdn
    let fragment = document.createDocumentFragment();
    let child;
    while (child = this.$el.firstChild) {
      fragment.appendChild(child);
    }
    this.startCompile(fragment);

  }

  //编译{{*****}},替换数据
  startCompile(fragment) {
    function replace(fragment) {
      Array.from(fragment.childNodes).forEach((node) => {
        let text = node.textContent;//文本内容
        let reg = /\{\{(.*)\}\}/g
        //必须是节点类型是文本节点而且带有{{}}
        if(node.nodeType === 3 && reg.test(text)) {
          let arr = RegExp.$1.split('.');
          let val = this;
          arr.forEach((item) => {
            val = val[item];
          });
          //替换掉模板数据
          //开始监听数据变化
          new Watch(this, RegExp.$1, (newVal) => { 
            node.textContent = text.replace(/\{\{(.*)\}\}/, newVal);
            //清空Dep;
            Dep.target = null;

          });
          node.textContent = text.replace(/\{\{(.*)\}\}/, val);

        }
        if(node.nodeType === 1) {
          //编译v-model或者:model;
          //input的双向数据绑定
          this.compileModel(node);
        }

        // 这里做了判断，如果有子节点的话 使用递归
        if (node.childNodes) {
          replace.call(this, node);
        }
      });
    }
    replace.call(this, fragment);
    this.$el.appendChild(fragment);
  }

  //编译model
  compileModel(node) {
    let nodeAttr = node.attributes;
    Array.from(nodeAttr).forEach((attr) => {
      if(attr.name.indexOf('v-') !== -1  || attr.name.indexOf(':') !== -1 ) {
        let arr = attr.value.split('.');
        let val = this; //vue 实例
        arr.forEach((key) => {
          val = val[key];
        });
        node.value = val;
        //model ===> view
        new Watch(this, attr.value, (newVal) => { 
          node.value = newVal;
          //清空Dep;
          Dep.target = null;
        });
        //view =>>>>>>>>> model
        //开始监听属性变化
        node.addEventListener('input', (evt) => {
          evt = evt || event;
          let targetValue = evt.target.value;
          let arr = attr.value.split('.');
          let val = this; //vue 实例
          arr.forEach((key, index) => {
            //如果val[key]为object，继续遍历
            if(typeof val[key] === 'object') {
              val = val[key];
            } else {
              //如果是数组最后一个key，说明可以赋值了
              if(index == arr.length - 1) {
                val[key] = targetValue;
              }
            }
          });
          val
        });
      }

    })
  }

  //数据监听
  Observe(data) {
    for(let key in data) {
      let val = data[key];
      this.observe(val);
      Object.defineProperty(data, key, {
        enumerable: true,//可以进行枚举
        get: () => {
          Dep.target && this.dep.addSub(Dep.target);
          return val;
        },
        set: (newval) => {
          if(val === newval) return;
          val = newval;
          //继续进行深度监听
          this.observe(newval);
          this.dep.notify();
        }
      });
    }
  }
}


//在更新模板的时候把数据进行监听，在获取数据的时候把数据进行订阅，如果数据改变的时候，使用通知去更新watch函数中的update重新选择页面