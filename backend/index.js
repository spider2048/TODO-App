const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const sanitize = require('sanitize-html')

const db = new sqlite3.Database('./db/database.db', sqlite3.OPEN_READWRITE)
const app = express()
let entries = 0

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/listTasks', (req, resp) => {
    db.all('SELECT id,title,due,status FROM tasks ORDER BY due DESC', [], (err, rows) => {
        if (err)
            resp.status(500)
        else
            resp.status(200).json(rows)
    })
})


app.post('/addTask', (req, resp) => {
    const title = sanitize(req.body.title)
    const due = sanitize(req.body.due)

    if (title == '' || due == '')
        resp.status(500).send('title/due is null')
    else {
        db.get('INSERT INTO tasks ("id", "title", "due", "status") VALUES (?, ?, ?, 0)', [++entries, sanitize(req.body.title), sanitize(req.body.due)], (err, row) => {
            if (err) resp.status(500).send(err)
            else resp.status(200).json(entries)
        })
    }
})


app.post('/toggleTask', (req, resp) => {
    db.get('SELECT status FROM tasks WHERE id=?', [sanitize(req.body.id)], (err, row) => {
        if (err) {
            resp.status(500).send(err)
        } else {
            db.get('UPDATE tasks SET "status"=? WHERE "id"=?', [row.status == 1 ? 0: 1, req.body.id], (err, row) => {
                if (err)
                    resp.status(500).send(err)
                else
                    resp.status(200).send(row)
            })
        }
    })
})

app.post('/deleteTask', (req, resp) => {
    db.get('DELETE FROM tasks WHERE "id"=?', [parseInt(req.body.id)], (err, row) => {
        if (err) resp.status(500).send(err)
        else resp.status(200).send(row)
    })
})

app.listen(9000, () => {
    console.log(`running on :9000`)
    db.get('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIVATE KEY, title TEXT, due INTEGER, status TINYINT);', (err, row) => {
        if (err) throw err;

        db.get('SELECT id as cnt FROM tasks ORDER BY id DESC LIMIT 1', (err, row) => {
            console.log(err, row)
            if (row != undefined)
                entries = (row.cnt ?? 0) + 1
        })
    })

})