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
      function addNode (children, isRoot) {
        // newChildren获取的正确
        // 但是需要判断label不存在才能执行addNode
        let hasNode = false
        children.forEach(child => {
          if (child.label === dirPath) {
            hasNode = true
          }
        })

        if (!hasNode) { // 判断节点不存在
          id++
          children.push({
            id,
            fullPath: isRoot ? dirPath : dirPathArr.slice(0, dirPathChildrenLevel).join('/') + '/' + dirPath,
            label: dirPath,
            children: [],
            message,
            ...externalData
          })
        }
      }

      let isfirstLevelLabelExist = false // 第一层是否存在了
      // 匹配超集
      treeData.forEach(relativePathObj => { // {label:'', children: []}
        // 利用对象子集的拼接赋值
        let newChildren = relativePathObj.children // 第一层children[array]

        switch (dirPathChildrenLevel) {
          case 0: // 判断第一层是否存在这个label, 只判断一次
            if (dirPath === relativePathObj.label) {
              isfirstLevelLabelExist = true
              return false
            }
            break

          case 1:
            addNode(newChildren)
            break

          default:
            let level = 1 // 每层只有一个children，查询在第几层children
            while (level < dirPathChildrenLevel) { // dirPathChildrenLevel >= 2
              newChildren.forEach((child, childIndex) => {
                if (child.label === dirPathArr[level]) { // 该层上包含这个path
                  newChildren = child.children
                  return false
                }
              })
              level++
            }
            addNode(newChildren)
            break
        }
      })

      // 当tredata中空或者多个根部节点，必须要添加一条
      if (!isfirstLevelLabelExist && dirPathChildrenLevel === 0) {
        addNode(treeData, true)
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

  return {
    treeData: sortTreeData(treeData),
    treeNodelength: id
  }
}

function sortTreeData (treeData) {
  // 排序第一层
  for (let rootNode of treeData) {
    let filesArr = []
    let foldersArr = []

    let children = rootNode.children
    children.forEach(child => {
      child.children.length
        ? foldersArr.push(child)
        : filesArr.push(child)
    })
    rootNode.children = [
      ...filesArr,
      ...foldersArr
    ]
  }
  return treeData
}

/**
 * [getTreeNode 根据完整路径, 1:查找treeData的节点; 2:设置文件描述]
 * @param  {[type]} treeData      [树]
 * @param  {[type]} filePath      [文件的相对路径]
 * @param  {String} message       [设置节点在树上的描述]
 * @param  {Object} externalData  [节点上增加扩展数据]
 * @return {[type]}               [文件在树上的节点]
 */
export function getTreeNode (treeData, filePath, message = '', externalData = {}) {
  let nodeItem = {}
  let filePathArr = filePath.split('/')

  // 查找第一层的children
  let newChildren = [] // 子集的继承
  treeData.forEach(treeNode => {
    if (treeNode.label === filePathArr[0]) { // 判断第一层存在在哪里
      if (filePathArr.length === 1) { // 避免的上传多文件的时间戳为同一个的错误
        nodeItem = treeNode
      } else {
        newChildren = treeNode.children
      }
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
            if (message) {
              child.message = message
            }

            // 扩展数据
            for (const i in externalData) {
              child[i] = externalData[i]
            }

            nodeItem = child
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
