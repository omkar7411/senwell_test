const express = require('express');
const body_parser = require('body-parser');
const mysql = require('mysql2');
const bluebird = require('bluebird');

const port = 3000;
const app = express();

app.use(body_parser.json());

const db = bluebird.promisifyAll(mysql.createPool({
    host: 'localhost',
    user: 'system',
    database: 'senwell',
    password: 'admin',
    connectTimeout: 60000
}));

app.use((req, res, next) => {
    next();
});

app.get('/home', (req, res) => {
    console.log("start");
    setTimeout(() => {
        console.log("waiting");
    }, 1000);

    console.log("end");
    res.send("this is home page");
});

app.post('/data_insert', async (req, res) => {
    let response={};
    try {
        const insertQuery = `
            INSERT INTO senwell.emp_table (first_name_name, last_name_name, department, address, dob, salary) VALUES (
                '${req.body.first_name_name}',
                '${req.body.last_name_name}',
                '${req.body.department}',
                '${req.body.address}',
                '${req.body.dob}',
                ${req.body.salary}
            )`;

        const insertDataRes = await doQuery(insertQuery);
        // console.log(insertDataRes);
        if(insertDataRes.affectedRows > 0){
            response['message'] = "data inserted successfully";
        }
        res.json(response);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/filter', async (req, res) => {
    let response={};
    try {
        const filter_by_department_query = `select * from senwell.emp_table where department= '${req.body.department}'`;

        const result = await doQuery(filter_by_department_query); 
        console.log(insertDataRes);
        response["rows"] = result.map(obj => ({...obj}));
        res.send(response);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/update', async (req, res) => {
    try {
        const updateQuery = `
            UPDATE senwell.emp_table 
            SET 
                first_name_name = '${req.body.first_name_name}',
                last_name_name = '${req.body.last_name_name}',
                department = '${req.body.department}',
                address = '${req.body.address}',
                dob = '${req.body.dob}',
                salary = ${req.body.salary}
            WHERE
                your_condition_here`; 

        const result = await doQuery(updateQuery);
        return _.isEmpty(result) ? res.send("something went wrong"): res.send("updated successfully");
        
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Internal Server Error');
    }
});

function doQuery(query) {
    return new bluebird((resolve, reject) => {
        query = query.replace('undefined', 'null');
        db.queryAsync({
            sql: query
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});
