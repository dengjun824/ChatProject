var routes = function (server, io) {
    server.get('/', function (request, response) {
        console.log('DEBUG: [route-/] - received request for root path, session: ' + JSON.stringify(request.sessionContext.data));
        if (!request.sessionContext || !request.sessionContext.get("account_id")) {
            server.renderHtml(request, response, '<script type=\"text/javascript\">location.href="/login.html"</script>');
        }
        else {
            request.url = '/index.html';
            server.renderHtml(request, response, '<script type=\"text/javascript\">location.href="/index.html"</script>');
        }
    });

    server.get('/index.html', function (request, response) {
        console.log('DEBUG: [route-index] - received request for index page, session: ' + JSON.stringify(request.sessionContext.data));
        if (!request.sessionContext || !request.sessionContext.get("account_id")) {
            server.renderHtml(request, response, '<script type=\"text/javascript\">location.href="/login.html"</script>');
        }
        else {
            server.render(request, response, { userAccount: request.sessionContext.get("account_id") });
        }
    });

    server.get('/register.html', function (request, response) {
        console.log('DEBUG: [route-register] - received request for register page, session: ' + JSON.stringify(request.sessionContext.data));
        if (!request.sessionContext || !request.sessionContext.get("account_id")) {
            server.render(request, response, null);
        } else {
            server.renderHtml(request, response, '<script type=\"text/javascript\">location.href="/index.html"</script>');
        }
    });

    server.get('/login.html', function (request, response) {
        console.log('DEBUG: [route-login] - received request for login page, session: ' + JSON.stringify(request.sessionContext.data));
        if (!request.sessionContext || !request.sessionContext.get("account_id")) {
            server.render(request, response, null);
        } else {
            server.renderHtml(request, response, '<script type=\"text/javascript\">location.href="/index.html"</script>');
        }
    });

    server.get('/post.html', function (request, response) {
        console.log('DEBUG: [route-post] - received request for post page, session: ' + JSON.stringify(request.sessionContext.data));
        if (!request.sessionContext || !request.sessionContext.get("account_id")) {
            server.renderHtml(request, response, '<script type=\"text/javascript\">window.location.href="/login.html"</script>');
        } else {
            server.render(request, response, null);
        }
    });

    server.get('/chat.html', function (request, response) {
        console.log('DEBUG: [route-post] - received request for chat page, session: ' + JSON.stringify(request.sessionContext.data));
        if (!request.sessionContext || !request.sessionContext.get("account_id")) {
            server.renderHtml(request, response, '<script type=\"text/javascript\">window.location.href="/login.html"</script>');
        } else {
            server.render(request, response, { userAccount: request.sessionContext.get("account_id") });
        }
    });

    server.post('/registercheck', function (request, response) {
        if (request.body && request.body.account && request.body.account.length > 0) {
            var mongoCommon = require('./../../mongo/mongoCommon');
            var commonUtil = require('./../../classes/utilities/commonUtil');
            var mongo = new mongoCommon();
            var collection = 'user';
            var input = {
                account: request.body.account,
                password: commonUtil.tryToConvertToMD5(request.body.password),
                email: request.body.email,
                tel: request.body.tel
            };
            var queryFilter = {
                collection: collection,
                filters: { account: input.account },
                limit: -1
            };
            mongo.selectData(queryFilter, function (result) {
                if (result.content.length == 0) {
                    mongo.saveData(collection, input, function (saveResult) {
                        if (saveResult.status) {
                            request.sessionContext.set("account_id", request.body.account);
                            server.renderData(request, response, 'true');
                        }
                        else {
                            server.renderData(request, response, 'false');
                        }
                    });
                }
                else {
                    server.renderData(request, response, 'exist')
                }
            });
            console.log('DEBUG: [route-registercheck] - received request for /registercheck, checking user...');
        }
        else {
            console.log('DEBUG: [route-registercheck] - user not authenticated, wrong account or missing.');
            server.renderData(request, response, 'false');
        }
    });

    server.post('/logincheck', function (request, response) {
        if (request.body && request.body.account && request.body.account.length > 0) {
            var mongoCommon = require('./../../mongo/mongoCommon');
            var commonUtil = require('./../../classes/utilities/commonUtil');
            var mongo = new mongoCommon();
            var collection = 'user';
            var input = {
                account: request.body.account,
                password: commonUtil.tryToConvertToMD5(request.body.password)
            };
            var queryFilter = {
                collection: collection,
                filters: input,
                limit: -1
            };
            mongo.selectData(queryFilter, function (result) {
                if (result.content.length == 0) {
                    server.renderData(request, response, 'false')
                }
                else {
                    request.sessionContext.set("account_id", request.body.account);
                    server.renderData(request, response, 'true')
                }
            });
            console.log('DEBUG: [route-logincheck] - received request for /logincheck, checking user...');
        }
        else {
            console.log('DEBUG: [route-logincheck] - user not authenticated, wrong account or missing.');
            server.renderData(request, response, 'false');
        }
    });

    server.post('/savepostinfo', function (request, response) {
        if (request.body && request.body.content && request.body.content.length > 0) {
            var mongoCommon = require('./../../mongo/mongoCommon');
            var mongo = new mongoCommon();
            var collection = 'postMessage';
            var input = {
                author: request.sessionContext.get("account_id"),
                content: request.body.content,
                postDate: new Date(Date.parse(request.body.postDate)),
                saveDate: new Date(),
                comments: []
            };
            mongo.saveData(collection, input, function (saveResult) {
                if (saveResult.status) {
                    server.renderData(request, response, 'true');
                }
                else {
                    server.renderData(request, response, 'false');
                }
            });
        }
        else {
            console.log('DEBUG: [route-savepostinfo] - request error or content is empty!');
            server.renderData(request, response, 'false');
        }
    });

    server.post('/savecomments', function (request, response) {
        if (request.body && request.body.content && request.body.content.length > 0) {
            var mongoCommon = require('./../../mongo/mongoCommon');
            var mongo = new mongoCommon();
            var collection = 'postMessage';
            var comments = {
                from: request.sessionContext.get("account_id"),
                commentDate: new Date(),
                comment: request.body.content
            };
            var filterData = {
                _id: mongo.getObjectId(request.body.id)
            };
            var updateData = {
                $push: { 'comments': comments }
            };
            mongo.updateDataArray(collection, filterData, updateData, function (saveResult) {
                if (saveResult.status) {
                    server.renderData(request, response, request.body.id);
                }
                else {
                    server.renderData(request, response, 'false');
                }
            });
        }
        else {
            console.log('DEBUG: [route-savecomments] - request error or content is empty!');
            server.renderData(request, response, 'false');
        }
    });

    server.get('/joint.html', function (request, response) {
        //console.log('DEBUG: [route-joint] - received request for chat page, session: ' + JSON.stringify(request.sessionContext.data));
        server.render(request, response, null);
    });

    server.get('/learning.html', function (request, response) {
        server.render(request, response, null);
    });
};

exports.Routes = routes;