# newton

首先，经过测试发现，有几个动作很快：

1. 文件md5，快到时间可以忽略；

另外几个动作很慢：

1. js压缩
2. webpack，其中的babel解析、压缩
3. 文件发送到cdn

所以，在执行慢动作前，最好能使用快动作做一些优化，减少慢动作涉及到的文件和循环次数。

### todo list

1. 增加文件编译缓存，加速编译
3. 增加uglify之后的文件对比，是有压缩后变小才使用
4. js compress 增加ignore目录或文件
5. screw_ie8 http://javascript.sg/using-uglifys-screw-ie8-option-in-gulp/
6. css prefix自动补全
2. 增加图片base64,
8. 文件地址后的search(?)和hash(#)，md5后可以给补上