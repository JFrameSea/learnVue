function observe(data) {
  if (!data || typeof data !== 'object') {
    return;
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}

function defineReactive(data, key, val) {
  observe(val);
  const dep = new Dep();
  Object.defineProperty(data, key, {
    get() {
      // 收集依赖
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      // 通知所有的依赖更新
      val = newVal;
      dep.notify();
    }
  })
}

function Dep() {
  this.subs = [];
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub)
  },
  notify: function() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}

function Watcher(vm, exp, cb) {
  this.vm = vm;
  this.cb = cb;
  this.exp = exp;
  // 这一步把Observer观察者和Watcher监听者关联上了
  this.value = this.get();
}

Watcher.prototype = {
  update() {
    var value = this.vm.data[this.exp];
    var oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal);
    }
  },
  get: function() {
    Dep.target = this;  // 缓存自己
    var value = this.vm.data[this.exp]  // 强制执行监听器里的get函数
    Dep.target = null;  // 释放自己
    return value;
  }
}

function MyVue(el, data, exp) {
  var self = this;
  this.data = data;

  // 把data里面的属性代理到MyVue实例上
  Object.keys(data).forEach(key => {
    self.proxyKeys(key);
  })

  observe(data);

  const element = document.getElementById(el);
  element.innerHTML = this.data[exp];

  new Watcher(this, exp, function (value) {
    element.innerHTML = value;
  });
  return this;
}

MyVue.prototype.proxyKeys = function(key) {
  const self = this;
  Object.defineProperty(this, key, {
    get() {
      return self.data[key];
    },
    set(val) {
      self.data[key] = val;
    }
  })
}

