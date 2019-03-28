/**
 * 定义前端使用的接口
 * @author zhuRui
 */
import {
    changePath,
    changePathFull,
    startFtp,
    getCurrentPath,
    ftpUpload,
    ftpUploads,
    mkdir,
    rmdir,
    logOut,
    deleteFile,
    clearCache
} from '../util/ftp_func'

const express = require('express')
const app = express()
const ERROR_CODE = '0000001'
const dataOk = {code: '0000000', msg: '请求处理成功'};
const dataEr = {code: ERROR_CODE, msg: ''};
var bodyparser = require('body-parser');

let currentPath = '';
let uploadFiles = []; // 上传的文件名

app.use(bodyparser.urlencoded({extende:true}));
app.use(bodyparser.json())

app.get('/startFtp', function(req, res) {
    startFtp (req.query, function (data) {
        if (data === ERROR_CODE) {
            let resData = Object.assign({}, dataEr, {msg: '登录失败！'});
            res.send(resData);
        } else {
            getCurrentPath(function (currentPath) {
                let resData = Object.assign({}, dataOk);
                resData.data = data
                resData.currentPath = currentPath
                res.send(resData);
            });
        }
    })
});

app.get('/changePath', function (req, res) {
    let path = req.query.path;
    changePath(path, function (data) {
        getCurrentPath( function (currentPath) {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });

    })
})

app.get('/changePathFull', function (req, res) {
    let fullPath = req.query.fullPath;
    changePathFull(fullPath,function (data) {
        getCurrentPath(function (currentPath) {
            let resData = Object.assign({}, dataOk);
            resData.data = data
            resData.currentPath = currentPath
            res.send(resData);
        });
    })
})

// 文件上传
// app.post('/fileUpload', function (req, res) {
//     let resData = Object.assign({}, dataOk);
//     uploadFiles = [];
//     req.files.forEach(function (item) {
//         uploadFiles.push(item.originalname)
//     })
//     ftpUpload (uploadFiles,function (fileNames) {
//         resData.fileNames = fileNames
//         clearCache('./uploads/')
//         res.send(resData);
//     })
// })

// 无http请求文件上传
app.post('/fileInfoUploads', function (req, res) {
    let resData = Object.assign({}, dataOk);
    ftpUploads (req.body.filePath ,function (fileNames) {
        resData.fileNames = fileNames
        res.send(resData);
    })
})

// 新建文件夹
app.get('/newFolder', function (req, res) {
    let resData = {};
    getCurrentPath( function (currentPath) {
        try {
            mkdir(currentPath + '/' + req.query.newFolder, function (err) {
                if (err) {
                    resData = Object.assign({}, dataEr);
                    resData.msg = err;
                    res.send(resData);
                } else {
                    resData = Object.assign({}, dataOk);
                    res.send(resData);
                }
            }, req.query.newFolder)
        } catch (e) {
            console.log(e)
        }
    });
})

// 删除文件夹
app.get('/removeDirectory', function (req, res) {
    let resData = {};
    getCurrentPath( function (currentPath) {
        rmdir(currentPath + '/' + req.query.deleteFolder, function (err) {
            if (err) {
                resData = Object.assign({}, dataEr);
                resData.msg = err;
                res.send(resData);
            } else {
                resData = Object.assign({}, dataOk);
                res.send(resData);
            }
        })
    })
})

// 删除文件
app.get('/deleteFile', function (req, res) {
    let resData = {};
    getCurrentPath( function (currentPath) {
        console.log(req.query.fileName)
        deleteFile(currentPath + '/' + req.query.fileName, function (err) {
            if (err) {
                resData = Object.assign({}, dataEr);
                resData.msg = err;
                res.send(resData);
            } else {
                resData = Object.assign({}, dataOk);
                res.send(resData);
            }
        })
    })
})

// 退出登录
app.get('/logout', function (req, res) {
    let resData = Object.assign({}, dataOk);
    logOut(function () {
        res.send(resData);
    })
})

module.exports = app
