const express = require('express');
const app = express();
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const replaceText = (text) => { return text.replace(/\n/g, "").replace(/\s/g, "") };
const targetUrl = 'https://www.jianshu.com/';
let data = []
app.get('/', function(req, res){
    request(targetUrl, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(body); // 当前的$ 为body的选择器
            $('#list-container .note-list li').each(function(i,elem) {
                let _this = $(elem);
                data.push({
                    id: _this.attr('data-note-id'),
                    slug: _this.find('.title').attr('href').replace(/\/p\//, ""),
                    author: {
                        slug: _this.find('.avatar').attr('href').replace(/\/u\//, ""),
                        avatar: _this.find('.avatar img').attr('src'),
                        nickname: replaceText(_this.find('.blue-link').text()),
                        sharedTime: _this.find('.time').attr('data-shared-at')
                    },
                    title: replaceText(_this.find('.title').text()),
                    abstract: replaceText(_this.find('.abstract').text()),
                    thumbnails: _this.find('.wrap-img img').attr('src'),
                    collection_tag: replaceText(_this.find('.collection-tag').text()),
                    reads_count: replaceText(_this.find('.ic-list-read').parent().text()) * 1,
                    comments_count: replaceText(_this.find('.ic-list-comments').parent().text()) * 1,
                    likes_count: replaceText(_this.find('.ic-list-like').parent().text()) * 1
                });
            });
            fs.writeFile(__dirname + '/data/article.json', JSON.stringify({
                status: 0,
                data: data
            }), function (err) {
                if (err) { throw err };
                console.log('写入完成');
            });
            res.send('获取成功');
        }
    });
});
app.listen(3000);