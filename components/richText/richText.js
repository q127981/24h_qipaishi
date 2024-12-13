const supportDateFormat = ['YY-MM', 'YY.MM.DD', 'YY-MM-DD', 'YY/MM/DD', 'YY.MM.DD HH:MM', 'YY/MM/DD HH:MM', 'YY-MM-DD HH:MM']; //支持的日期格式
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //编辑器是否只读
    readOnly: {
      type: Boolean,
      value: false
    },
    //编辑器默认提示语
    placeholder: {
      type: String,
      value: '开始编辑吧...'
    },
    //插入的日期格式
    formatDate: {
      type: String,
      value: 'YY-MM-DD HH:MM'
    },
    buttonTxt: {
      type: String,
      value: '保存'
    }, //编辑器是否只读
    html: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    formats: {}, //样式集合
    textTool: false, //文本工具是否显示，默认隐藏
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //富文本工具点击事件
    toolEvent(res) {
      let {
        tool_name
      } = res.currentTarget.dataset;
      switch (tool_name) {
        case 'insertImage': //插入图片
          this.insertImageEvent();
          break;
        case 'showTextTool': //展示文字编辑工具
          this.showTextTool();
          break;
        case 'insertDate': //插入日期
          this.insertDate();
          break;
        case 'undo': //撤退（向前）
          this.undo();
          break;
        case 'redo': //撤退（向后）
          this.restore();
          break;
        case 'clear': //清除
          this.clearBeforeEvent();
          break;
      }
    },

    //编辑器初始化完成时触发
    onEditorReady() {
      this.triggerEvent('onEditorReady');
      this.createSelectorQuery().select('#editor').context(res => {
        console.log('createSelectorQuery=>', res)
        this.editorCtx = res.context;
        let rtTxt = this.properties.html;
        this.setContents(rtTxt);
      }).exec();
    },

    //设置富文本内容
    setContents(rechtext) {
      this.editorCtx.setContents({
        html: rechtext,
        success: res => {
          console.log('[setContents success]', res)
        }
      })
    },

    //撤销
    undo() {
      this.editorCtx.undo();
      this.triggerEvent('undo');
    },

    //恢复
    restore() {
      this.editorCtx.redo();
      this.triggerEvent('restore');
    },

    /**
     * 修改样式，样式item点击事件
     * @param {String} name 样式名称 
     * @param {String} value 样式值
     */
    format(res) {
      let {
        name,
        value
      } = res.target.dataset;
      if (!name) return;
      this.editorCtx.format(name, value);
    },

    // 通过 Context 方法改变编辑器内样式时触发，返回选区已设置的样式
    onStatusChange(res) {
      const formats = res.detail;
      console.log('onStatusChange=>',res)
      this.setData({
        formats
      })
    },

    //在光标位置插入下换线
    insertDivider() {
      this.editorCtx.insertDivider({
        success: res => {
          console.log('[insert divider success]', res)
        }
      })
    },

    //清空编辑器内容
    clear() {
      this.editorCtx.clear({
        success: res => {
          this.triggerEvent('clearSuccess');
        }
      })
    },

    //清空编辑器内容前的事件
    clearBeforeEvent() {
      this.triggerEvent('clearBeforeEvent');
    },

    //清除当前选区的样式
    removeFormat() {
      this.editorCtx.removeFormat();
    },

    //插入日期
    insertDate() {
      if (supportDateFormat.indexOf(this.data.formatDate) < 0) {
        console.error(`Format Date ${this.data.formatDate} error \n It should be one of them [${supportDateFormat}]`)
        return;
      }
      let formatDate = this.getThisDate(this.data.formatDate);
      this.editorCtx.insertText({
        text: formatDate
      })
    },

    //插入图片事件
    insertImageEvent() {
      //触发父组件选择图片方法
      this.triggerEvent('insertImageEvent', {});
    },

    /**
     * 插入图片方法
     * @param {String} path 图片地址，仅支持 http(s)、base64、云图片(2.8.0)、临时文件(2.8.3)
     */
    insertImageMethod(path) {
      return new Promise((resolve, reject) => {
        this.editorCtx.insertImage({
          src: path,
          data: {
            id: 'imgage',
          },
          success: res => {
            resolve(res);
          },
          fail: res => {
            reject(res);
          }
        })
      })
    },

    //保存按钮事件，获取编辑器内容
    getEditorContent() {
      this.editorCtx.getContents({
        success: res => {
          // console.log('[getContents rich text success]', res)
          this.triggerEvent('getEditorContent', {
            value: res,
          });
        }
      })
    },

    //show文本工具栏
    showTextTool() {
      this.setData({
        textTool: !this.data.textTool
      })
    },

    //编辑器聚焦时触发
    bindfocus(res) {
      this.triggerEvent('bindfocus', {
        value: res,
      });
    },
    //编辑器失去焦点时触发
    bindblur(res) {
      this.triggerEvent('bindblur', {
        value: res,
      });
    },

    //编辑器输入中时触发
    bindinput(res) {
      this.triggerEvent('bindinput', {
        value: res,
      });
    },

    /**
     * 返回当前日期
     * @format {String} 需要返回的日期格式
     */
    getThisDate(format) {
      let date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes();

      //数值补0方法
      const zero = (value) => {
        if (value < 10) return '0' + value;
        return value;
      }

      switch (format) {
        case 'YY-MM':
          return year + '-' + zero(month);
        case 'YY.MM.DD':
          return year + '.' + zero(month) + '.' + zero(day);
        case 'YY-MM-DD':
          return year + '-' + zero(month) + '-' + zero(day);
        case 'YY.MM.DD HH:MM':
          return year + '.' + zero(month) + '.' + zero(day) + ' ' + zero(h) + ':' + zero(m);
        case 'YY/MM/DD HH:MM':
          return year + '/' + zero(month) + '/' + zero(day) + ' ' + zero(h) + ':' + zero(m);
        case 'YY-MM-DD HH:MM':
          return year + '-' + zero(month) + '-' + zero(day) + ' ' + zero(h) + ':' + zero(m);
        default:
          return year + '/' + zero(month) + '/' + zero(day);
      }
    }
  },

  /**
   * 组件生命周期函数-在组件布局完成后执行)
   */
  ready() {

  },
})