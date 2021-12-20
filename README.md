# treeify

> 上传的文件夹或多个文件转化成树状结构数据


## 安装

```bash
npm i input-files-to-tree
```

## 使用

```html
<input type="file" name="" webkitdirectory id="files">
```

### 基本使用

```js
import treeify from './filesPathTransformToTree.js'

document.getElementById('files').onchange = e => {
  const tar = Array.from(e.target.files)
  const d = treeify(tar)

  console.log(d)
}
```

#### 输出

```js
{
	"treeData": [{
		"id": 2,
		"fullPath": "testFolder-1",
		"label": "testFolder-1",
		"children": [{
			"id": 3,
			"fullPath": "testFolder-1/.DS_Store",
			"label": ".DS_Store",
			"children": []
		}, {
			"id": 4,
			"fullPath": "testFolder-1/1.txt",
			"label": "1.txt",
			"children": []
		}, {
			"id": 5,
			"fullPath": "testFolder-1/2",
			"label": "2",
			"children": [{
				"id": 6,
				"fullPath": "testFolder-1/2/.DS_Store",
				"label": ".DS_Store",
				"children": []
			}, {
				"id": 7,
				"fullPath": "testFolder-1/2/2.txt",
				"label": "2.txt",
				"children": []
			}, {
				"id": 8,
				"fullPath": "testFolder-1/2/3",
				"label": "3",
				"children": [{
					"id": 9,
					"fullPath": "testFolder-1/2/3/.DS_Store",
					"label": ".DS_Store",
					"children": []
				}, {
					"id": 10,
					"fullPath": "testFolder-1/2/3/3.txt",
					"label": "3.txt",
					"children": []
				}, {
					"id": 11,
					"fullPath": "testFolder-1/2/3/4",
					"label": "4",
					"children": [{
						"id": 12,
						"fullPath": "testFolder-1/2/3/4/4.txt",
						"label": "4.txt",
						"children": []
					}]
				}]
			}]
		}]
	}],
	"treeNodelength": 12
}
```


### 节点增加额外数据

```js
import treeify from './filesPathTransformToTree.js'

document.getElementById('files').onchange = e => {
  const tar = Array.from(e.target.files).map(i => {
    i.externalData = {newKey_1: "val_1"} // 额外数据需要是个对象
    return i
  })

  const d = treeify(tar)

  console.log(d)
}
```

#### 输出

```js
{
	"treeData": [{
		"id": 2,
		"fullPath": "testFolder-1",
		"label": "testFolder-1",
		"children": [...]
    "newKey_1": "val_1"
  }]
  ...
}

