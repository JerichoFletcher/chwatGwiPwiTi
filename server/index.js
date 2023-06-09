const backend = require('./backend/backendIntf');
const http = require('http');
const { isNumeric } = require('./backend/num');
const sql = require('./database/sql');

const hostname = '192.168.0.6';
const port = 8000;

const server = http.createServer(async(req, res) => {
    try{
        if(req.url.startsWith('/ping')){
            const timestamp = new Date();

            console.log(`[PING] Ping request on ${timestamp}`);
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            });
            res.write(`Ping received on ${timestamp}`);
            res.end();
        }else if(req.url.startsWith('/hist')){
            const url = new URL(req.url, `http://${req.headers.host}`);
            const id = url.searchParams.get('id');
            if(id === null){
                const historyList = await sql.getAllHistory();
                console.log(`[INFO] Sending response: ${JSON.stringify({data: historyList})}`);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.write(JSON.stringify({data: historyList}));
                res.end();
            }else{
                const chats = await sql.getChatinHistory(parseInt(id));
                console.log(`[INFO] Sending response: ${JSON.stringify({data: chats})}`);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.write(JSON.stringify({data: chats}));
                res.end();
            }
        }else if(req.url.startsWith('/ask')){
            const url = new URL(req.url, `http://${req.headers.host}`);
            const query = url.searchParams.get('q');
            const historyId = url.searchParams.get('hid');
            const algorithm = url.searchParams.get('alg');
            const uwuifyLevel = url.searchParams.get('uwu');

            // Enforce that q and alg must be present
            if(query === null || algorithm === null){
                res.writeHead(400, {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*'
                });
                res.write('Missing argument q or alg');
                res.end();
            }else{    
                const config = new backend.UserQueryConfig();
                config.algorithm = algorithm;
                if(isNumeric(historyId)){
                    config.historyId = parseInt(historyId);
                }else{
                    config.requestNewHistoryId = true;
                }
                config.uwuifyLevel = uwuifyLevel !== null ? parseInt(uwuifyLevel) : 0;

                const qRes = await backend.acceptUserQuery(query, config);
                console.log(`[INFO] Sending response: ${JSON.stringify(qRes)}`);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.write(JSON.stringify(qRes));
                res.end();
            }
        }else{
            res.writeHead(404, {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            });
            res.write('Not found');
            res.end();
        }
    }catch(e){
        console.error(e);
    }
});

server.listen(port, hostname, async() => {
    console.log(`[INFO] Server running at http://${hostname}:${port}/`);
    // backend.init();
});

server.on('close', () => {
    backend.end();
});
