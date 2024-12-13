Component({
  properties: {
    // scan-qr-code | fenxiang | kongtiao | jiaruwomen | shangpindingdan1 | dingdan | youhuiquan | changjianwentixiangguanwenti | zhangdan | dianhua1 | fenlei1 | tongjitu | shangmenjiazheng | baojie | taocan | erweima1 | fangjian | shebeiguanli1 | chongzhi | gonggao | yuangongguanli | renwubobao | a-xiugai2 | huiyuan | heimingdan1 | dingwei | mendian | zeng | cuxiaohuodong-youhuiquan | shangpindingdan | jiantou_liebiaoshouqi_o | jiantou_liebiaozhankai_o | fenlei | shangpin | xiugai | guanbi | guanbi1 | bluetooth | jia | jian | ditu1 | daohang1 | chengseyuechi | renlianshibie1 | heimingdan | e23lock | dingdan1 | kapian | open-door | setting-01 | youjiantou | xieti | rili | duiqifangshi | todolist | zuohuitui | u | h | duiqifangshi1 | tupian_huaban | shanchu | duiqifangshi2 | A | B | dianpaixu | shuzipaixu | duiqifangshi3 | arrow-default | meituan | douyin | sousuo | right | shijian1 | naozhong1 | iov-store | shangdian | flag | tongji | dangwei | zhangben | ditu-copy | ditu | jizhangben | wenhao | zhangbenzhangdanjizhangzhangbu | woshou | tuangou | weixinzhifu | dianhua | 24gl-swapHorizontal3 | yue | tuangouquan | youhuikaquan | jisuanqi | naozhong | weibiaoti-3 | close | shandian | huiyuanlibao | shijian | shebeiguanli | changeorder | qr-code | employee
    name: {
      type: String,
    },
    // string | string[]
    color: {
      type: null,
      observer: function(color) {
        this.setData({
          colors: this.fixColor(),
          isStr: typeof color === 'string',
        });
      }
    },
    size: {
      type: Number,
      value: 18,
      observer: function(size) {
        this.setData({
          svgSize: size,
        });
      },
    },
  },
  data: {
    colors: '',
    svgSize: 18,
    quot: '"',
    isStr: true,
  },
  methods: {
    fixColor: function() {
      var color = this.data.color;
      var hex2rgb = this.hex2rgb;

      if (typeof color === 'string') {
        return color.indexOf('#') === 0 ? hex2rgb(color) : color;
      }

      return color.map(function (item) {
        return item.indexOf('#') === 0 ? hex2rgb(item) : item;
      });
    },
    hex2rgb: function(hex) {
      var rgb = [];

      hex = hex.substr(1);

      if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
      }

      hex.replace(/../g, function(color) {
        rgb.push(parseInt(color, 0x10));
        return color;
      });

      return 'rgb(' + rgb.join(',') + ')';
    }
  }
});
