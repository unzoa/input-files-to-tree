/**
 * [filesPathTransformToTree 获取input type=file上传的files，转换成tree数据格式]
 * @param  {[arrar]}             files   []
 * @param  {[String || number]}  message [文件在树上的描述]
 * @return {[array][number]}             [tree]
 * [tree数据格式]
 * [
 *  {
 *    label: 1,
 *    children: [{
 *      id: Number,
 *      fullpath: String,
 *      label: '1-1',
 *      children: [{
 *        label: '1-1-1',
 *        children: []
 *      }],
 *      message: '',
 *      ...externalData // 后期需要添加节点数据
 *    }]
 *  }
 * ]
 */
export function filesPathTransformToTree (files, message = '') {
  let treeData = []
  let id = 1
  /**
   * [superFunc 递归去添加子集]
   * @param  {[type]} dirPathArr   [文件的相对路径的数组]['1', '1-1', '1-1-1', 'a-a-a-a']
   * @param  {Object} externalData [额外添加数据]
   */
  function superFunc (dirPathArr, externalData = {}) {
    // 查询dirPathArr
    dirPathArr.forEach((dirPath, dirPathChildrenLevel) => {
      let isfirstLevelLabelExist = false // 第一层是否存在了

      // 匹配超集
      treeData.forEach(relativePathObj => { // {} || {label:'', children: []}
        if (dirPathChildrenLevel === 0) { // 判断第一层是否存在这个label, 只判断一次
          if (dirPath === relativePathObj.label) {
            isfirstLevelLabelExist = true
            return false
          }
        } else { // 深于第一层
          let newChildren = relativePathObj.children // 超集的第一层的children: array

          /**
           * [level 查询在第几层children：利用对象子集的拼接赋值]
           * @type {Number}
           */
          let level = 1
          while (level < dirPathChildrenLevel) {
            newChildren.forEach((child, childIndex) => {
              newChildren = child.children || []
            })
            level++
          }

          if (newChildren.label === dirPathArr[dirPathChildrenLevel - 1] ||
            !newChildren.label) { // 判断获取的children
            // 判断子路径 label 是否存在
            let flag = false
            newChildren.forEach((child, childIndex) => {
              flag = child.label === dirPath
            })

            if (!flag) {
              id++
              newChildren.push({
                id,
                fullPath: dirPathArr.slice(0, dirPathChildrenLevel).join('/') + '/' + dirPath,
                label: dirPath,
                children: [],
                message,
                ...externalData
              })
            }
          }
        }
      })

      if (!isfirstLevelLabelExist && dirPathChildrenLevel === 0) {
        treeData.push({
          id,
          fullPath: dirPath,
          label: dirPath,
          children: [],
          message,
          ...externalData
        })
      }
    })
  }

  for (let i in files) {
    if (!isNaN(i)) {
      let file = files[i]
      let filePathArr = []
      // 判断是否是文件夹文件
      if (file.webkitRelativePath) { // 文件夹
        filePathArr = file.webkitRelativePath.split('/') // ['1', '1-1', 'fileName']
      } else {
        filePathArr = [file.name]
      }
      superFunc(filePathArr, file.externalData) // 处理本文件的路径到tree数据中
    }
  }

  return { treeData, treeNodelength: id }
}

/**
 * [getTreeNode 根据完整路径, 1:查找treeData的节点; 2:设置文件描述]
 * @param  {[type]} treeData [树]
 * @param  {[type]} filePath [文件的相对路径]
 * @param  {String} message  [设置节点在树上的描述]
 * @return {[type]}          [文件在树上的节点]
 */
export function getTreeNode (treeData, filePath, message = '') {
  let nodeItem = {}
  let filePathArr = filePath.split('/')

  // 匹配treeData
  // 查找第一层的children
  let newChildren = [] // 子集的继承
  treeData.forEach(nodeItem => {
    if (nodeItem.label === filePathArr[0]) { // 判断第一层存在在哪里
      newChildren = nodeItem.children
      return false
    }
  })

  let filePath1ToLength = filePathArr.slice(1, filePathArr.length)
  filePath1ToLength.forEach(path => {
    // **查询n层children**
    const searchNewChildren = () => {
      newChildren.forEach(child => {
        // 判断子集的label在哪里
        if (child.label === path) {
          if (!child.children.length) {
            nodeItem = child

            if (message) {
              child.message = message
            }
          } else {
            newChildren = child.children
            searchNewChildren()
          }

          return false
        }
      })
    }
    searchNewChildren()
  })

  return nodeItem
}
