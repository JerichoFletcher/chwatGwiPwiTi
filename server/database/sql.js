const mysqldump = require('mysqldump');
const mysql = require('mysql');
const sqlinit = require('./sqlinit.js');
const Num = require('../backend/num.js');

const databaseName = 'chatgwipwiti';
const
    pathSchema = './server/database/chatgwipwiti_schema.sql',
    pathValues = './server/database/chatgwipwiti_values.sql';

const cred = {
    host: 'localhost',
    user: 'chatgwipwiti',
    password: 'kevin',
    database: databaseName
};


const con = mysql.createConnection(cred);

async function loadSQL(){
    return sqlinit.importDBMySQL(con, pathSchema).then(() => sqlinit.importDBMySQL(con, pathValues));
}

function dumpSQL(){
    try{
        console.log('[INFO] Dumping database...');
        console.time('[INFO] Finished dumping');
        mysqldump({
            connection: cred,
            dumpToFile: pathSchema,
            dump: {
                data: false
            }
        });
        mysqldump({
            connection: cred,
            dumpToFile: pathValues,
            dump: {
                schema: false,
            }
        });
    }catch(e){
        console.error(e);
    }finally{
        console.timeEnd('[INFO] Finished dumping');
    }
}

function getData(query, values = []) {
    return new Promise((resolve, reject) => {
        con.query(query, values, (error, result) => {
            if(error)reject(error);
            resolve(result);
        });
    });
}
//prosedur menambah histori
async function addHistory(name){
    //con.connect();
    for(let attempt = 0; attempt < 10; attempt++){
        const id = Num.randomInt(1, 2**31);
        const lookup = await getHistoryName(id);
        console.log(lookup);
        if(lookup.length === 0){
            let query = 'INSERT INTO histories(history_id, history_name) VALUES ( ? , ? )';
            con.query(query, [id, name], function (err, result) {
                if (err) throw err;
            });
            return id;
        }
    }
    throw new Error('Failed to generate unique history ID');
    //con.end();
    //return query;
}

function addChat(id,timestamp,question,answer,algorithm) {
    let query = 'INSERT INTO chats(history_id,timestamp,question,answer,algorithm) VALUES ( ? , ?,  ? , ? , ? )';
  
    con.query(query,[id,timestamp,question,answer,algorithm],function (err, result) {
        if (err) throw err;
    });
    //con.end();
}
async function addQuestion(question,answer){
    let queryquestion = 'SELECT * FROM questions WHERE question_pattern = ?';
    let result = await getData(queryquestion, [question]);
    if (result.length !== 0) {
        let query = 'UPDATE questions SET answer_pattern = ? WHERE question_pattern = ?';
        con.query(query,[answer,question],function (err, result) {
          if (err) throw err;
        });
        return false;
    }
    let query = 'INSERT INTO questions VALUES ( ? , ? )';
    con.query(query,[question,answer],function (err, result) {
      if (err) throw err;
    });
    return true;
}

async function removeQuestion(question){
    let queryquestion = 'SELECT * FROM questions WHERE question_pattern = ?';
    let result = await getData(queryquestion, [question]);
    if (result.length === 0) {
        return false;
    }
    else {
    let query = 'DELETE FROM questions where question_pattern = ? ';
    con.query(query,[question],function (err, result) {
        if (err) throw err;
    });
        return true;
    }
}

async function getQuestions() {
    let query = 'SELECT * FROM questions';
    const data = await getData(query);
    //console.log('The data is:', data);
    return data;
}

async function getAllHistory() {
    let query = 'SELECT * FROM histories';
    const data = await getData(query);
    //console.log('The data is:', data);
    return data;
}

async function getHistoryName(id) {
    let query = 'SELECT history_name FROM histories WHERE history_id = ?';
    const data = await getData(query, [id]);
    //console.log('The data is:', data);
    return data;
}

async function getChatinHistory(id) {
    let query = 'SELECT history_id,timestamp,question,answer,algorithm FROM histories NATURAL JOIN chats WHERE history_id = ? ORDER BY timestamp';
    //con.connect();
    const data = await getData(query, [id]);
    //console.log('The data is:', data);
    return data;
    //let result;
    //con.query(query, function (error, results, fields) {
    //  if (error) throw error;
    //
    //  // Hasil query tersimpan di dalam variable 'results'
    //  console.log(results);
    //
    //  // Tutup koneksi ke database
    //  con.end();
    //});
    ////console.log('The data is:', data);
    //return result;
}

//console.log(getChatinHistory(1));
//default sql;

module.exports = {loadSQL, dumpSQL, addHistory, addChat, addQuestion, removeQuestion, getQuestions, getAllHistory, getHistoryName, getChatinHistory};
