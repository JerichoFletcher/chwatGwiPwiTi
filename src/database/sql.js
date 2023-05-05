// import fs from 'fs';
import mysqldump from 'mysqldump';
import mysql from 'mysql';
import { importDB } from './sqlInit.js';

const databaseName = 'chatgwipwiti';
const
    pathSchema = './src/database/chatgwipwiti_schema.sql',
    pathValues = './src/database/chatgwipwiti_values.sql';

const cred = {
    host: 'localhost',
    user: 'root',
    password: 'kevin',
    database: databaseName
};

const con = mysql.createConnection(cred);

export async function loadSQL(){
    await importDB(databaseName, cred);
    // return importFromFile(databaseName, pathSchema).then(() => importFromFile(databaseName, pathValues));
}

export async function dumpSQL(){
    console.time('[INFO] Finished dumping');
    return mysqldump({
        connection: cred,
        dumpToFile: pathSchema,
        dump: {
            schema: {
                table: {
                    dropIfExist: true
                }
            },
            data: false
        }
    }).then(() => mysqldump({
        connection: cred,
        dumpToFile: pathValues,
        dump: {
            schema: false,
            data: {
                verbose: false,
                maxRowsPerInsertStatement: 100
            }
        }
    })).catch(e => console.error(e)).then(() => console.timeEnd('[INFO] Finished dumping'));
}

export function getData(query, values = []) {
    //const query = 'SELECT * FROM chats';
    // try {
    //     const results = await new Promise((resolve, reject) => {
    //         con.query(query,(error, results, fields) => {
    //             if (error) {
    //               reject(error);
    //             } else {
    //               resolve(results);
    //             }
    //         });
    //     });
    //     return results;
    // } catch (error) {
    //     console.error('Error:', error);
    // } finally {
    //     con.end();
    // }
    return new Promise((resolve, reject) => {
        con.query(query, values, (error, result) => {
            if(error)reject(error);
            resolve(result);
        });
    });
}
//prosedur menambah histori
export function addHistory(name){
    let query = 'INSERT INTO histories(history_name) VALUES ( ? )';
    //con.connect();
    con.query(query,[name],function (err, result) {
        if (err) throw err;
    });
    //con.end();
    //return query;
}

export function addChat(id,question,answer,algorithm) {
    let query = 'INSERT INTO chats(history_id,question,answer,algorithm) VALUES ( ? , ? , ? , ? )';
  
    con.query(query,[id,question,answer,algorithm],function (err, result) {
        if (err) throw err;
    });
    //con.end();
}
export async function addQuestion(question,answer){
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

export async function removeQuestion(question){
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

export async function getQuestions() {
    let query = 'SELECT * FROM questions';
    const data = await getData(query);
    //console.log('The data is:', data);
    return data;
}

export async function getAllHistory() {
    let query = 'SELECT * FROM histories';
    const data = await getData(query);
    //console.log('The data is:', data);
    return data;
}

export async function getHistoryName(id) {
    let query = 'SELECT history_name FROM histories WHERE history_id = ?';
    const data = await getData(query, [id]);
    //console.log('The data is:', data);
    return data;
}

export async function getChatinHistory(id) {
    let query = 'SELECT * FROM histories NATURAL JOIN chats WHERE history_id = ? ORDER BY timestamp';
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
//export default sql;
