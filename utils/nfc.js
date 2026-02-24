// utils/nfc.js
// NFC管理器 - 确保全局只有一个NFC实例在运行
class NfcManager {
  constructor() {
    this.nfcAdapter = null
    this.isInitialized = false
    this.isDiscovering = false
    this.discoveredCallback = null
    this.currentPage = null
  }

  // 初始化NFC
  init(pageName) {
    console.log(`[NFC管理器] 初始化NFC，当前页面: ${pageName}`)
    
    // 如果已经有其他页面在使用NFC，先停止
    if (this.currentPage && this.currentPage !== pageName) {
      console.log(`[NFC管理器] 检测到其他页面(${this.currentPage})正在使用NFC，先停止`)
      this.stop()
    }

    // 设置当前页面
    this.currentPage = pageName
    
    // 获取NFC适配器
    this.nfcAdapter = wx.getNFCAdapter()
    if (!this.nfcAdapter) {
      console.error('[NFC管理器] 设备不支持NFC')
      return false
    }

    this.isInitialized = true
    console.log('[NFC管理器] NFC初始化成功')
    return true
  }

  // 开始发现NFC标签
  startDiscovery(callback, pageName) {
    console.log(`[NFC管理器] 开始发现NFC标签，页面: ${pageName}`)
    
    // 检查是否有权限
    if (this.currentPage !== pageName) {
      console.error(`[NFC管理器] 页面${pageName}没有权限使用NFC，当前页面是${this.currentPage}`)
      return false
    }

    if (!this.isInitialized || !this.nfcAdapter) {
      console.error('[NFC管理器] NFC未初始化')
      return false
    }

    // 如果已经在发现中，先停止
    if (this.isDiscovering) {
      this.stopDiscovery()
    }

    // 设置回调
    this.discoveredCallback = callback
    
    // 注册发现事件
    try {
      this.nfcAdapter.onDiscovered((res) => {
        console.log('[NFC管理器] 发现NFC标签')
        if (this.discoveredCallback) {
          this.discoveredCallback(res)
        }
      })

      // 开始发现
      this.nfcAdapter.startDiscovery({
        success: () => {
          console.log('[NFC管理器] 开始发现NFC标签成功')
          this.isDiscovering = true
        },
        fail: (err) => {
          console.error('[NFC管理器] 开始发现NFC标签失败:', err)
          this.isDiscovering = false
          // 清理回调
          this.discoveredCallback = null
        }
      })

      return true
    } catch (error) {
      console.error('[NFC管理器] 开始发现NFC标签异常:', error)
      this.discoveredCallback = null
      return false
    }
  }

  // 停止发现
  stopDiscovery() {
    console.log('[NFC管理器] 停止发现NFC标签')
    
    if (this.nfcAdapter && this.isDiscovering) {
      try {
        this.nfcAdapter.stopDiscovery()
        this.isDiscovering = false
      } catch (error) {
        console.error('[NFC管理器] 停止发现NFC标签失败:', error)
      }
    }
  }

  // 停止并清理NFC
  stop() {
    console.log('[NFC管理器] 停止NFC')
    
    // 停止发现
    this.stopDiscovery()
    
    // 移除事件监听器
    if (this.nfcAdapter) {
      try {
        this.nfcAdapter.offDiscovered()
      } catch (error) {
        console.error('[NFC管理器] 移除事件监听器失败:', error)
      }
    }
    
    // 清理状态
    this.discoveredCallback = null
    this.isInitialized = false
    this.isDiscovering = false
    
    // 保留当前页面信息，用于检查权限
  }

  // 获取NDEF对象
  getNdef() {
    if (this.nfcAdapter) {
      return this.nfcAdapter.getNdef()
    }
    return null
  }

  // 检查是否支持NFC
  isSupported() {
    return this.nfcAdapter !== null
  }

  // 检查是否正在发现
  isDiscoveryActive() {
    return this.isDiscovering
  }

  // 清理特定页面的NFC资源
  cleanupPage(pageName) {
    console.log(`[NFC管理器] 清理页面${pageName}的NFC资源`)
    if (this.currentPage === pageName) {
      this.stop()
    }
  }
}

// 导出单例
export const nfcManager = new NfcManager()

/**
 * String to ArrayBuffer
 * @param {String} text 字符串
 * @param {Array} extraBytes 额外的字节数组
 */
export function str2ab(text, extraBytes = []) {
  const uriStr = encodeURIComponent(text)
  const bytes = []
  for (let i = 0; i < uriStr.length; i++) {
    const code = uriStr.charAt(i)
    if (code === '%') {
      const hex = uriStr.slice(i + 1, i + 3)
      const hexVal = parseInt(hex, 16)
      bytes.push(hexVal)
      i += 2
    } else {
      bytes.push(code.charCodeAt(0))
    }
  }
  if (extraBytes && extraBytes.length > 0) {
    bytes.unshift(...extraBytes)
  }
  return new Uint8Array(bytes).buffer
}

/**
 * ArrayBuffer to String
 * @param {ArrayBuffer} buffer 
 */
export function ab2str(buffer) {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return str
}

/**
 * 检查URL Scheme格式是否正确
 * @param {String} scheme 
 */
export function validateUrlScheme(scheme) {
  // 微信小程序URL Scheme格式检查 - 只要开头是weixin://dl/business就可以
  return scheme && scheme.startsWith('weixin://dl/business')
}

/**
 * 创建NFC记录数据
 * @param {String} urlScheme 小程序URL Scheme
 */
export function createNfcRecords(urlScheme,storeId,roomId) {
  const records = [
    {
      id: str2ab('mini-ios'),
      tnf: 1, // Well-Known
      type: str2ab('U'),
      payload: str2ab(urlScheme, [0]) // 首位加0x00
    },
    {
      id: str2ab('mini-android'),
      tnf: 4, // NFC Forum external type
      type: str2ab('android.com:pkg'),
      payload: str2ab('com.tencent.mm')
    },
    {
      id: str2ab('scyanzu'), // 可选的ID，用于标识记录
      tnf: 1, // Well-Known Type
      type: str2ab('T'), // NFC Forum定义的TEXT类型
      payload: str2ab('nfc=1&roomId='+roomId+'&storeId='+storeId) // 文本内容，编码为UTF-8，语言代码为en
    },
  ]
  return records
}

/**
 * 解析NFC标签信息
 * @param {Object} nfcData NFC数据
 */
export function parseNfcData(nfcData) {
  console.log('原始NFC数据:', nfcData)
  const result = {
    tagType: '',
    content: '',
    details: '',
    isMiniProgramSupported: false,
    urlScheme: '',
    techs: [],
    text: '',
  }

  if (nfcData && nfcData.messages && nfcData.messages.length > 0) {
    // 获取技术类型
    if (nfcData.techs) {
      result.techs = nfcData.techs
    }
    
    // 检查是否包含NDEF技术
    if (nfcData.techs && nfcData.techs.includes('NDEF')) {
      result.tagType = 'NDEF'
    } else {
      result.tagType = '非NDEF'
    }
    
    // 解析NDEF消息
    const messages = nfcData.messages
    let content = ''
    let details = ''
    
    messages.forEach((message, msgIndex) => {
      
      if (message.records && message.records.length > 0) {
          message.records.forEach((record, recordIndex) => {
          const recordType = ab2str(record.type)
          const recordPayload = ab2str(record.payload)
          const recordId = record.id ? ab2str(record.id) : ''
          // console.log(recordId);
          // console.log(recordType);
          // console.log(recordPayload);
          if(recordId == 'scyanzu'){
            result.text = recordPayload;
          }
          // 检查是否包含小程序URL Scheme
          if (recordType === 'U' && recordPayload.startsWith('weixin://')) {
            result.isMiniProgramSupported = true
            result.urlScheme = recordPayload
          }
          // 检查Android应用记录
          if (recordType === 'android.com:pkg' && recordPayload === 'com.tencent.mm') {
            result.isMiniProgramSupported = true
          }
          })
      }
    })
    
    result.content = content.trim()
    result.details = details.trim()
    
    // 如果没有找到URL Scheme，但检测到Android应用记录，说明可能是小程序标签
    if (!result.urlScheme && result.isMiniProgramSupported) {
      result.details += '\n\n注意: 检测到微信应用记录，但未找到有效的URL Scheme'
    }
    
  } else {
    result.tagType = '未知类型'
    result.content = '无法读取标签内容'
    result.details = '标签可能不是NDEF格式或为空'
  }

  console.log('解析结果:', result)
  return result
}
