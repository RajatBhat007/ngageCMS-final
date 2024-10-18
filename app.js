
const express = require("express");
const multer = require('multer');
const path = require('path');

const cors = require("cors");
const mysql = require("mysql2");
const fs = require("fs")
const https = require("https")
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const bodyParser = require('body-parser');

const xlsx = require('xlsx');

const app = express();
const port = 9000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const corsOptions = {
    origin: '*', // Allow all origins, adjust as needed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

app.use(cors(corsOptions));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the destination directory
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
        cb(null, uniqueName); // Generate a unique name for the file
    }
});

const upload = multer({ storage: storage });

//Create a MySQL database connection
const db = mysql.createPool({
// host: "43.205.164.14",
// user: "TgcRajatP2L",
// password: "Rajat@P2Lcub",
// database: "db_tgc_game_beta"

host: "13.201.246.207", //pro
//  host: "43.205.164.14",
  user: "TgcRajatP2L",
  password: "Rajat@P2Lcub",
  database: "db_tgc_game_pro", // Database 2
  // database: "db_tgc_game_beta",
});

// const db = mysql.createPool({
// host: "43.205.164.14",
// user: "TgcRajatP2L",
// password: "Rajat@P2Lcub",
// database: "db_new_ngage_beta",
// });




db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    db.releaseConnection(connection);
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
    db.releaseConnection(connection);
});

// API endpoint to get all data from tbl_business_type
app.get('/getBusinessType', (req, res) => {
    const query = 'SELECT * FROM tbl_business_type';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Failed to retrieve data' });
            return;
        }
        res.json(results);
    });
});


// API endpoint to get all data from tbl_business_type
app.get('/getIndustry', (req, res) => {
    const query = 'SELECT * FROM tbl_industry';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Failed to retrieve data' });
            return;
        }
        res.json(results);
    });
});




app.post('/addOrganization', upload.single('logo'), (req, res) => {
    const { id_ngage_Organization, organization_name, Id_industry, Id_Business_type, Description, default_email, Password } = req.body;
    const status = 'A';
    const updated_datetime = new Date();
    const logo = req.file ? req.file.path : null;

    // Check if id_ngage_Organization is provided
    if (id_ngage_Organization) {
        const query = `
 UPDATE tbl_ngage_organization
 SET organization_name = ?, updated_datetime = ?, Id_industry = ?, Id_Business_type = ?, Description = ?, logo = ?, default_email = ?, status = ?, Password = ?
 WHERE id_ngage_Organization = ?
 `;
        const values = [organization_name, updated_datetime, Id_industry, Id_Business_type, Description, logo, default_email, status, Password, id_ngage_Organization];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error updating organization in MySQL database:', err);
                res.status(500).send('Error updating organization in MySQL database');
                return;
            }
            res.status(200).json({ message: 'Organization updated successfully' });
        });
    } else {
        const query = `
 INSERT INTO tbl_ngage_organization (organization_name, updated_datetime, Id_industry, Id_Business_type, Description, logo, default_email, status, Password)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
 `;
        const values = [organization_name, updated_datetime, Id_industry, Id_Business_type, Description, logo, default_email, status, Password];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error inserting data into MySQL database:', err);
                res.status(500).send('Error inserting data into MySQL database');
                return;
            }
            res.status(201).json({ message: 'Organization added successfully' });
        });
    }
});


// GET Endpoint to Retrieve Organizations
app.get('/getOrganizations', (req, res) => {
    const query = 'SELECT * FROM tbl_ngage_organization';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data from MySQL database:', err);
            res.status(500).send('Error fetching data from MySQL database');
            return;
        }
        res.status(200).json(results);
    });
});


app.post('/addDepartment', (req, res) => {
    const { ID_department, Department_Name, Id_CmsUser, ID_Organization } = req.body;
    const IsActive = 'A';

    let query = '';
    let values = [];

    if (ID_department) {
        // Update operation
        query = `
        UPDATE tbl_department
        SET Department_Name = ?, IsActive = ?, Id_CmsUser = ?, ID_Organization = ?, Updated_Date_Time = CURRENT_TIMESTAMP
        WHERE ID_department = ?
        `;
        values = [Department_Name, IsActive, Id_CmsUser, ID_Organization, ID_department];
    } else {
        // Insert operation
        query = `
        INSERT INTO tbl_department (Department_Name, IsActive, Id_CmsUser, ID_Organization, Updated_Date_Time)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        values = [Department_Name, IsActive, Id_CmsUser, ID_Organization];
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ message: 'Error executing query' });
            return;
        }

        if (ID_department) {
            res.status(200).json({ message: 'Data updated successfully' });
        } else {
            res.status(201).json({ message: 'Data inserted successfully' });
        }
    });
});


// GET Endpoint to Retrieve Active Departments by Organization
app.get('/getDepartments', (req, res) => {
    const { ID_Organization } = req.query;
    const IsActive = 'A';

    const query = `
 SELECT * FROM tbl_department
 WHERE ID_Organization = ? AND IsActive = ?
 `;

    const values = [ID_Organization, IsActive];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching data from MySQL database:', err);
            res.status(500).send('Error fetching data from MySQL database');
            return;
        }
        res.status(200).json(results);
    });
});

app.post('/addRole', (req, res) => {
    const { ID_role, Role_name, ID_Organization, ID_Department, Id_CmsUser } = req.body;
    const IsActive = 'A';

    let query = '';
    let values = [];

    if (ID_role) {
        // Update operation
        query = `
        UPDATE tbl_roles
        SET Role_name = ?, ID_Organization = ?, ID_Department = ?, IsActive = ?, Id_CmsUser = ?, Updated_Date_Time = CURRENT_TIMESTAMP
        WHERE ID_role = ?
        `;
        values = [Role_name, ID_Organization, ID_Department, IsActive, Id_CmsUser, ID_role];
    } else {
        // Insert operation
        query = `
        INSERT INTO tbl_roles (Role_name, ID_Organization, ID_Department, IsActive, Id_CmsUser, Updated_Date_Time)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        values = [Role_name, ID_Organization, ID_Department, IsActive, Id_CmsUser];
    }

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error executing data into MySQL database');
            return;
        }

        if (ID_role) {
            res.status(200).json({ message: 'Role updated successfully' });
        } else {
            res.status(201).json({ message: 'Role added successfully' });
        }
    });
});


// GET Endpoint to Retrieve Active Departments by Organization
app.get('/getRole', (req, res) => {
    const { ID_Organization } = req.query;
    const IsActive = 'A';

    const query = `
 SELECT * FROM tbl_roles
 WHERE ID_Organization = ? AND IsActive = ?
 `;

    const values = [ID_Organization, IsActive];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error fetching data from MySQL database:', err);
            res.status(500).send('Error fetching data from MySQL database');
            return;
        }
        res.status(200).json(results);
    });
});


// POST Endpoint for Superadmin Login
app.post('/superadmin/login', (req, res) => {
    const { email, password } = req.body;

    // Query to check if the email and password match
    const query = `
 SELECT * FROM tbl_super_admin WHERE Email = ? AND Password = ?
 `;

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error retrieving superadmin data from MySQL database:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Check if any results were returned
        if (results.length === 0) {
            res.status(401).send('Invalid email or password');
            return;
        }

        // If the email and password match, respond with all details
        const superAdminDetails = results[0];
        res.status(200).json(superAdminDetails);
    });
});

// API endpoint to get all data from tbl_business_type
app.get('/getGameList', (req, res) => {
    const query = 'SELECT * FROM tbl_game_master';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Failed to retrieve data' });
            return;
        }
        res.json(results);
    });
});


// app.post('/postCreateOrganization', (req, res) => {
//     const {
//         ID_ORGANIZATION,
//         ID_INDUSTRY,
//         ID_BUSINESS_TYPE,
//         ORGANIZATION_NAME,
//         CONTACT_NAME,
//         CONTACTNUMBER,
//         CONTACTEMAIL,
//         DEFAULT_EMAIL,
//         STATUS,
//         Id_CmsUser,
//         Id_master_org
//     } = req.body;

//     const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

//     if (ID_ORGANIZATION) {
//         // Update existing organization
//         const query = `
//             UPDATE tbl_organization SET
//                 ID_INDUSTRY = ?,
//                 ID_BUSINESS_TYPE = ?,
//                 ORGANIZATION_NAME = ?,
//                 \`CONTACT NAME\` = ?,
//                 CONTACTNUMBER = ?,
//                 CONTACTEMAIL = ?,
//                 DEFAULT_EMAIL = ?,
//                 STATUS = ?,
//                 UPDATED_DATE_TIME = ?,
//                 Id_CmsUser = ?,
//                 Id_master_org = ?
//             WHERE ID_ORGANIZATION = ?
//         `;

//         const values = [
//             ID_INDUSTRY,
//             ID_BUSINESS_TYPE,
//             ORGANIZATION_NAME,
//             CONTACT_NAME,
//             CONTACTNUMBER,
//             CONTACTEMAIL,
//             DEFAULT_EMAIL,
//             STATUS,
//             currentDateTime, // Use system-generated date and time
//             Id_CmsUser,
//             Id_master_org,
//             ID_ORGANIZATION
//         ];

//         db.query(query, values, (err, results) => {
//             if (err) {
//                 console.error('Error executing query:', err);
//                 res.status(500).json({ error: 'Failed to update data' });
//                 return;
//             }
//             res.status(200).json({ message: 'Data updated successfully' });
//         });
//     } else {
//         console.log(ID_INDUSTRY);
//         // Insert new organization
//         const query = `
//             INSERT INTO tbl_organization (
//                 ID_INDUSTRY,
//                 ID_BUSINESS_TYPE,
//                 ORGANIZATION_NAME,
//                 \`CONTACT NAME\`,
//                 CONTACTNUMBER,
//                 CONTACTEMAIL,
//                 DEFAULT_EMAIL,
//                 STATUS,
//                 UPDATED_DATE_TIME,
//                 Id_CmsUser,
//                 Id_master_org
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         const values = [
//             ID_INDUSTRY,
//             ID_BUSINESS_TYPE,
//             ORGANIZATION_NAME,
//             CONTACT_NAME,
//             CONTACTNUMBER,
//             CONTACTEMAIL,
//             DEFAULT_EMAIL,
//             STATUS,
//             currentDateTime, // Use system-generated date and time
//             Id_CmsUser,
//             Id_master_org
//         ];

//         db.query(query, values, (err, results) => {
//             if (err) {
//                 console.error('Error executing query:', err);
//                 res.status(500).json({ error: 'Failed to insert data' });
//                 return;
//             }
//             res.status(201).json({ message: 'Data inserted successfully', id: results.insertId });
//         });
//     }
// });


// API endpoint to get all data from tbl_organization


app.post('/postCreateOrganization', (req, res) => {
    console.log(req.body);  // Log the request body to inspect its contents
    const {
        ID_ORGANIZATION,
        ID_INDUSTRY,
        ID_BUSINESS_TYPE,
        ORGANIZATION_NAME,
        CONTACT_NAME,
        CONTACTNUMBER,
        CONTACTEMAIL,
        DEFAULT_EMAIL,
        STATUS,
        Id_CmsUser,
        Id_master_org
    } = req.body;

    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (ID_ORGANIZATION) {
        // Update existing organization
        const query = `
            UPDATE tbl_organization SET
                ID_INDUSTRY = ?,
                ID_BUSINESS_TYPE = ?,
                ORGANIZATION_NAME = ?,
                \`CONTACT NAME\` = ?,
                CONTACTNUMBER = ?,
                CONTACTEMAIL = ?,
                DEFAULT_EMAIL = ?,
                STATUS = ?,
                UPDATED_DATE_TIME = ?,
                Id_CmsUser = ?,
                Id_master_org = ?
            WHERE ID_ORGANIZATION = ?
        `;

        const values = [
            ID_INDUSTRY,
            ID_BUSINESS_TYPE,
            ORGANIZATION_NAME,
            CONTACT_NAME,
            CONTACTNUMBER,
            CONTACTEMAIL,
            DEFAULT_EMAIL,
            STATUS,
            currentDateTime, // Use system-generated date and time
            Id_CmsUser,
            Id_master_org,
            ID_ORGANIZATION
        ];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Failed to update data' });
                return;
            }
            res.status(200).json({ message: 'Data updated successfully' });
        });
    } else {
        console.log(ID_INDUSTRY);
        // Insert new organization
        const query = `
            INSERT INTO tbl_organization (
                ID_INDUSTRY,
                ID_BUSINESS_TYPE,
                ORGANIZATION_NAME,
                \`CONTACT NAME\`,
                CONTACTNUMBER,
                CONTACTEMAIL,
                DEFAULT_EMAIL,
                STATUS,
                UPDATED_DATE_TIME,
                Id_CmsUser,
                Id_master_org
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            ID_INDUSTRY,
            ID_BUSINESS_TYPE,
            ORGANIZATION_NAME,
            CONTACT_NAME,
            CONTACTNUMBER,
            CONTACTEMAIL,
            DEFAULT_EMAIL,
            STATUS,
            currentDateTime, // Use system-generated date and time
            Id_CmsUser,
            Id_master_org
        ];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Failed to insert data' });
                return;
            }
            res.status(201).json({ message: 'Data inserted successfully', id: results.insertId });
        });
    }
});




app.get('/getAllOrganizations', (req, res) => {
    const query = 'SELECT * FROM tbl_organization';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Failed to retrieve data' });
        }
        res.json(results);
    });
});


// API endpoint to insert game assignment for an organization
app.post('/organization/:organizationId/game-assignment', (req, res) => {
    const organizationId = req.params.organizationId;
    const { gameIds } = req.body;

    if (!Array.isArray(gameIds) || gameIds.length === 0) {
        return res.status(400).json({ error: 'gameIds must be a non-empty array' });
    }

    // Generate the current date and time
    const assignmentDateTime = new Date().toISOString().replace('Z', '');

    // Prepare an array to hold all the values to be inserted
    const values = [];

    // Loop through each gameId and construct the values array
    gameIds.forEach(gameId => {
        values.push([organizationId, gameId, assignmentDateTime]);
    });

    // Insert data into tbl_game_assignment
    const query = `
 INSERT INTO tbl_game_assignment (ID_ORGANIZATION, ID_GAME, ASSIGNMENT_DATE_TIME)
 VALUES ?
 `;

    db.query(query, [values], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Failed to insert data into tbl_game_assignment' });
        }
        res.status(201).json({ message: 'Data inserted successfully', gameId: result.insertId });
    });
});

// API endpoint to insert and update CMS User for an organization
function getEncryptedString(str) {
    const password = "3sc3RLrpd17";
    const key = CryptoJS.SHA256(password);
    const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

    const encrypted = CryptoJS.AES.encrypt(str, key, { iv: iv });
    return encrypted.toString();
}

// app.post('/createOrUpdateCMSUser', (req, res) => {
//     const {
//         Id_CmsUser,
//         Name,
//         Email,
//         Phone_No,
//         Password,
//         IsActive,
//         ID_ORGANIZATION,
//         Id_ngage_org
//     } = req.body;

//     const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

//     // Validation (optional)
//     if (!Name || !Email || !Phone_No || !Password || !ID_ORGANIZATION) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Encrypt the password
//     const encryptedPassword = getEncryptedString(Password);

//     // Check if email already exists
//     const checkEmailQuery = `
//  SELECT COUNT(*) AS emailCount
//  FROM tbl_cms_users
//  WHERE Email = ?
//  `;

//     db.query(checkEmailQuery, [Email], (err, results) => {
//         if (err) {
//             console.error('Error checking email:', err);
//             res.status(500).json({ error: 'Failed to check email' });
//             return;
//         }

//         const emailCount = results[0].emailCount;

//         if (emailCount > 0) {
//             // Email already exists, return error
//             return res.status(400).json({ error: 'Email already exists' });
//         }

//         // Continue with insert or update operation
//         if (Id_CmsUser) {
//             // Update existing user
//             const updateQuery = `
//  UPDATE tbl_cms_users SET
//  Name = ?,
//  Email = ?,
//  Phone_No = ?,
//  Password = ?,
//  IsActive = ?,
//  Updated_Date_Time = ?,
//  ID_ORGANIZATION = ?,
//  ID_ROLE = 1,
//  Id_ngage_org=?
//  WHERE Id_CmsUser = ?
//  `;

//             const updateValues = [
//                 Name,
//                 Email,
//                 Phone_No,
//                 encryptedPassword,
//                 IsActive,
//                 currentDateTime,
//                 ID_ORGANIZATION,
//                 Id_ngage_org,
//                 Id_CmsUser
//             ];

//             db.query(updateQuery, updateValues, (err, results) => {
//                 if (err) {
//                     console.error('Error updating user:', err);
//                     res.status(500).json({ error: 'Failed to update user' });
//                     return;
//                 }
//                 res.status(200).json({ message: 'User updated successfully' });
//             });
//         } else {
//             // Insert new user
//             const insertQuery = `
//  INSERT INTO tbl_cms_users (
//  Name,
//  Email,
//  Phone_No,
//  Password,
//  IsActive,
//  Updated_Date_Time,
//  ID_ORGANIZATION,
//  ID_ROLE,
//  Id_ngage_org
//  ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
//  `;

//             const insertValues = [
//                 Name,
//                 Email,
//                 Phone_No,
//                 encryptedPassword,
//                 IsActive,
//                 currentDateTime,
//                 ID_ORGANIZATION,
//                 Id_ngage_org
//             ];

//             db.query(insertQuery, insertValues, (err, results) => {
//                 if (err) {
//                     console.error('Error inserting user:', err);
//                     res.status(500).json({ error: 'Failed to insert user' });
//                     return;
//                 }
//                 res.status(201).json({ message: 'User created successfully', id: results.insertId });
//             });
//         }
//     });
// });



app.post('/createOrUpdateCMSUser', (req, res) => {
    const {
        Id_CmsUser,
        Name,
        Email,
        Phone_No,
        Password,
        IsActive,
        Id_ngage_org
    } = req.body;

    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Validate the required fields
    if (!validateFields(req.body)) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Encrypt the password
    const encryptedPassword = getEncryptedString(Password);

    if (Id_CmsUser) {
        // Proceed with the update directly without checking if the email has changed
        updateUser(req.body, encryptedPassword, currentDateTime, res);
    } else {
        // Insert new user
        insertUser(req.body, encryptedPassword, currentDateTime, res);
    }
});

function validateFields({ Name, Email, Phone_No, Password, Id_CmsUser, ID_ORGANIZATION }) {
    return Name && Email && Phone_No && Password && (Id_CmsUser || ID_ORGANIZATION);
}

function updateUser({ Name, Email, Phone_No, IsActive, Id_ngage_org, Id_CmsUser }, encryptedPassword, currentDateTime, res) {
    const updateQuery = `
        UPDATE tbl_cms_users SET
            Name = ?,
            Email = ?,
            Phone_No = ?,
            Password = ?,
            IsActive = ?,
            Updated_Date_Time = ?,
            ID_ROLE = 1,
            Id_ngage_org = ?
        WHERE Id_CmsUser = ?
    `;

    const updateValues = [
        Name,
        Email,
        Phone_No,
        encryptedPassword,
        IsActive,
        currentDateTime,
        Id_ngage_org,
        Id_CmsUser
    ];

    db.query(updateQuery, updateValues, (err) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Failed to update user' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    });
}

function insertUser({ Name, Email, Phone_No, IsActive, ID_ORGANIZATION, Id_ngage_org }, encryptedPassword, currentDateTime, res) {
    const insertQuery = `
        INSERT INTO tbl_cms_users (
            Name,
            Email,
            Phone_No,
            Password,
            IsActive,
            Updated_Date_Time,
            ID_ORGANIZATION,
            ID_ROLE,
            Id_ngage_org
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `;

    const insertValues = [
        Name,
        Email,
        Phone_No,
        encryptedPassword,
        IsActive,
        currentDateTime,
        ID_ORGANIZATION,
        Id_ngage_org
    ];

    db.query(insertQuery, insertValues, (err, results) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: 'Failed to insert user' });
        }
        res.status(201).json({ message: 'User created successfully', id: results.insertId });
    });
}





app.get('/getCMSUsers', (req, res) => {
    const query = `
 SELECT 
 Id_CmsUser,
 Name,
 Email,
 Phone_No,
 Password,
 IsActive,
 Updated_Date_Time,
 ID_ORGANIZATION,
 ID_ROLE,
 Id_ngage_org
 FROM tbl_cms_users
 `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Failed to fetch data' });
            return;
        }
        res.status(200).json(results);
    });
});


// app.post("/postAddMinigames", upload.fields([{ name: 'front_image', maxCount: 1 }, { name: 'back_image', maxCount: 1 }]), (req, res) => {
//     const { id_game_list, id_game, org_id, game_name, game_url, enable_status, played, game_label } = req.body;
//     const front_image = req.files.front_image ? req.files.front_image[0].filename : null;
//     const back_image = req.files.back_image ? req.files.back_image[0].filename : null;
//     const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

//     if (id_game_list) {
//         // Update existing game
//         const query = `
//  UPDATE tbl_game_list SET
//  id_game = ?,
//  org_id = ?,
//  front_image = ?,
//  back_image = ?,
//  game_name = ?,
//  game_url = ?,
//  enable_status = ?,
//  updated_datetime = ?,
//  played = ?,
//  game_label = ?
//  WHERE id_game_list = ?
//  `;

//         const values = [
//             id_game,
//             org_id,
//             front_image,
//             back_image,
//             game_name,
//             game_url,
//             enable_status,
//             currentDateTime,
//             played,
//             game_label,
//             id_game_list
//         ];

//         db.query(query, values, (err, result) => {
//             if (err) {
//                 console.error("Error updating game details:", err);
//                 res.status(500).json({ error: "Failed to update game details" });
//                 return;
//             }
//             console.log("Game details updated successfully");
//             res.status(200).json({ message: "Game details updated successfully" });
//         });
//     } else {
//         // Insert new game
//         const query = `
//  INSERT INTO tbl_game_list (id_game, org_id, front_image, back_image, game_name, game_url, enable_status, updated_datetime, played, game_label)
//  VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
//  `;

//         const values = [
//             id_game,
//             org_id,
//             front_image,
//             back_image,
//             game_name,
//             game_url,
//             enable_status,
//             played,
//             game_label
//         ];

//         db.query(query, values, (err, result) => {
//             if (err) {
//                 console.error("Error inserting game details:", err);
//                 res.status(500).json({ error: "Failed to insert game details" });
//                 return;
//             }
//             console.log("Game details inserted successfully");
//             res.status(201).json({ message: "Game details inserted successfully", id: result.insertId });
//         });
//     }
// });


app.post("/postAddMinigames", (req, res) => {
    const { id_game_list, id_game, org_id, game_name, game_url, enable_status, played, game_label, front_image, back_image } = req.body;
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (id_game_list) {
        // Update existing game
        const query = `
        UPDATE tbl_game_list SET
        id_game = ?,
        org_id = ?,
        front_image = ?,
        back_image = ?,
        game_name = ?,
        game_url = ?,
        enable_status = ?,
        updated_datetime = ?,
        played = ?,
        game_label = ?
        WHERE id_game_list = ?
        `;

        const values = [
            id_game,
            org_id,
            front_image,
            back_image,
            game_name,
            game_url,
            enable_status,
            currentDateTime,
            played,
            game_label,
            id_game_list
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error updating game details:", err);
                res.status(500).json({ error: "Failed to update game details" });
                return;
            }
            console.log("Game details updated successfully");
            res.status(200).json({ message: "Game details updated successfully" });
        });
    } else {
        // Insert new game
        const query = `
        INSERT INTO tbl_game_list (id_game, org_id, front_image, back_image, game_name, game_url, enable_status, updated_datetime, played, game_label)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        `;

        const values = [
            id_game,
            org_id,
            front_image,
            back_image,
            game_name,
            game_url,
            enable_status,
            played,
            game_label
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error inserting game details:", err);
                res.status(500).json({ error: "Failed to insert game details" });
                return;
            }
            console.log("Game details inserted successfully");
            res.status(201).json({ message: "Game details inserted successfully", id: result.insertId });
        });
    }
});


app.get("/getMiniGameList/:orgId", (req, res) => {
    const orgId = req.params.orgId;

    // Construct the SQL SELECT query
    const query = `
 SELECT * FROM tbl_game_list WHERE org_id = ?
 `;

    // Execute the SQL query with the orgId as parameter
    db.query(
        query,
        [orgId],
        (err, result) => {
            if (err) {
                console.error("Error retrieving game details:", err);
                res.status(500).json({ error: "Failed to retrieve game details" });
                return;
            }
            res.status(200).json({ games: result });
        }
    );
});


app.post('/uploadEndUser', upload.single('file'), (req, res) => {
    const { org_id } = req.body;

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    if (!org_id) {
        return res.status(400).send('Organization ID is required.');
    }

    try {
        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheet_name_list = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        console.log(xlData);

        const errors = [];
        
        // Function to check if organization exists in db
        function checkOrganizationExists(orgId, callback) {
            const sql = 'SELECT COUNT(*) AS count FROM tbl_organization WHERE ID_ORGANIZATION = ?';
            db.query(sql, [orgId], (err, results) => {
                if (err) {
                    return callback(err, null);
                }
                callback(null, results[0].count > 0);
            });
        }

        // Insert data into the first database
        xlData.forEach((row, index) => {
            let { Name, Contactnumber, Password } = row; // Adjust based on actual column names in your Excel file

            // Validate required fields
            if (!Name || !Contactnumber || !Password) {
                const error = `Error in row ${index + 1}: Missing required fields`;
                console.error(error);
                errors.push(error);
                return; // Skip this row
            }

            // Sanitize Contactnumber by removing the + sign
            if (typeof Contactnumber === 'string') {
                Contactnumber = Contactnumber.replace('+', '');
            }

            const sql1 = `INSERT INTO tbl_temp_user (org_id, name, email, phone_number, password, city, updated_datetime, isActive) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'A')`;
            db.query(sql1, [org_id, Name, Contactnumber, Contactnumber, Password, ''], (err, result) => {
                if (err) {
                    const error = `Error inserting data into tbl_temp_user for row ${index + 1}: ${err.message}`;
                    console.error(error);
                    errors.push(error);
                }
            });

            // Check if the organization exists in db before inserting
            checkOrganizationExists(org_id, (err, exists) => {
                if (err) {
                    const error = `Error checking organization existence for row ${index + 1}: ${err.message}`;
                    console.error(error);
                    errors.push(error);
                    return;
                }

                if (exists) {
                    const sql2 = `INSERT INTO tbl_users (Name, Email, Phone_No, Password, Organization_Name, IsActive, Updated_Date_Time, ID_ORGANIZATION, Id_Avatar, login_type, Email_OTP, Id_Department, ID_ROLE, country_id, states_id, city_id, Id_CmsUser) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, NULL, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL)`;
                    db.query(sql2, [Name, Contactnumber, Contactnumber, Password, org_id, 'A', org_id], (err, result) => {
                        if (err) {
                            const error = `Error inserting data into tbl_users for row ${index + 1}: ${err.message}`;
                            console.error(error);
                            errors.push(error);
                        }
                    });
                } else {
                    const warning = `Organization with ID ${org_id} does not exist. Skipping user insertion for row ${index + 1}.`;
                    console.warn(warning);
                    errors.push(warning);
                }
            });
        });

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Errors encountered during processing',
                errors: errors
            });
        }

        res.json('File uploaded and data inserted successfully into both databases.');
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json('Error processing file');
    }
});



// Define API endpoint to update status for the same email and org_id in the database
app.post('/updateStatusFromExcel', upload.single('file'), (req, res) => {
    const { org_id } = req.body;

    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    if (!org_id) {
        return res.status(400).send('Organization ID is required.');
    }
    try {
        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheet_name_list = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

        // Process each row of data
        xlData.forEach((row) => {
            // Extract values from the row and ensure correct data types
            const email = String(row.Contactnumber); // Convert to string
            const newStatus = String(row.Status); // Convert to string

            // Execute SQL query to update status in the database
            const updateStatusQuery = `UPDATE tbl_temp_user SET isActive = ? WHERE email = ? AND org_id = ?`;
            db.query(updateStatusQuery, [newStatus, email, org_id], (err, result) => {
                if (err) {
                    console.error('Error updating status:', err);
                } else {
                    console.log(`Status updated for email: ${email}, org_id: ${org_id}`);
                }
            });
        });

        res.json('Status updated successfully from Excel.');
    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).json('Error processing Excel file');
    }
});




function getEncryptedString(str) {
    const password = "3sc3RLrpd17";
    const key = CryptoJS.SHA256(password);
    const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

    const encrypted = CryptoJS.AES.encrypt(str, key, { iv: iv });
    return encrypted.toString();
}

app.post('/loginCMSuser', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Encrypt the input password
    const encryptedPassword = getEncryptedString(password);

    const query = `
 SELECT Id_CmsUser, Name, Email, Phone_No, Password, ID_ORGANIZATION, ID_ROLE, Id_ngage_org
 FROM tbl_cms_users
 WHERE Email = ? AND Password = ? AND IsActive = "A"
 `;
    db.query(query, [email, encryptedPassword], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        const updateQuery = 'UPDATE tbl_cms_users SET Updated_Date_Time = CURRENT_TIMESTAMP WHERE Id_CmsUser = ?';
        db.query(updateQuery, [user.Id_CmsUser], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Failed to update user' });
            }

            // Construct the response object excluding Updated_Date_Time, IsActive, and Password
            const { Updated_Date_Time, IsActive, Password, ...userDetails } = user;

            res.status(200).json({
                message: 'Login successful',
                user: userDetails
            });
        });
    });
});



app.get('/minigamesConfig', (req, res) => {
    const { id_ngage_Organization } = req.query;

    if (!id_ngage_Organization) {
        return res.status(400).send('Missing required query parameter: id_ngage_Organization');
    }

    const sql = `
        SELECT id_sub_organization,sub_org_id, sub_org_name, ngage_logo, dashboard_logo, background_image
        FROM tbl_sub_organizations
        WHERE id_ngage_Organization = ?
    `;

    db.query(sql, [id_ngage_Organization], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Database query error');
        }

        if (results.length === 0) {
            return res.status(404).send('No records found');
        }

        res.json(results);
    });
});


// // API endpoint to upload images and insert data into MySQL
// app.post('/uploadOrgImages', upload.fields([
//     { name: 'ngage_logo', maxCount: 1 },
//     { name: 'dashboard_logo', maxCount: 1 },
//     { name: 'background_image', maxCount: 1 }
// ]), (req, res) => {
//     const { id_sub_organization, sub_org_id, sub_org_name, id_ngage_Organization } = req.body;
//     const ngage_logo = req.files['ngage_logo'] ? req.files['ngage_logo'][0].filename : null;
//     const dashboard_logo = req.files['dashboard_logo'] ? req.files['dashboard_logo'][0].filename : null;
//     const background_image = req.files['background_image'] ? req.files['background_image'][0].filename : null;

//     if (!sub_org_id || !sub_org_name || !id_ngage_Organization) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if the id_sub_organization exists
//     const checkQuery = 'SELECT * FROM tbl_sub_organizations WHERE id_sub_organization = ?';
//     db.query(checkQuery, [id_sub_organization], (checkErr, checkResults) => {
//         if (checkErr) {
//             return res.status(500).json({ error: checkErr.message });
//         }

//         let query;
//         let queryParams;

//         if (checkResults.length > 0) {
//             // Update existing record
//             query = `
//                 UPDATE tbl_sub_organizations
//                 SET sub_org_id = ?, sub_org_name = ?, updated_datetime = NOW(), id_ngage_Organization = ?, ngage_logo = ?, dashboard_logo = ?, background_image = ?
//                 WHERE id_sub_organization = ?
//             `;
//             queryParams = [sub_org_id, sub_org_name, id_ngage_Organization, ngage_logo, dashboard_logo, background_image, id_sub_organization];
//         } else {
//             // Insert new record
//             query = `
//                 INSERT INTO tbl_sub_organizations (sub_org_id, sub_org_name, updated_datetime, id_ngage_Organization, ngage_logo, dashboard_logo, background_image)
//                 VALUES (?, ?, NOW(), ?, ?, ?, ?)
//             `;
//             queryParams = [sub_org_id, sub_org_name, id_ngage_Organization, ngage_logo, dashboard_logo, background_image];
//         }

//         db.query(query, queryParams, (err, results) => {
//             if (err) {
//                 return res.status(500).json({ error: err.message });
//             }
//             res.status(200).json({ message: 'Data and images uploaded successfully' });
//         });
//     });
// });

app.post('/uploadOrgImages', upload.fields([
    { name: 'ngage_logo', maxCount: 1 },
    { name: 'dashboard_logo', maxCount: 1 },
    { name: 'background_image', maxCount: 1 }
]), (req, res) => {
    const { id_sub_organization, sub_org_id, sub_org_name, id_ngage_Organization } = req.body;
    const ngage_logo = req.files['ngage_logo'] ? req.files['ngage_logo'][0].filename : null;
    const dashboard_logo = req.files['dashboard_logo'] ? req.files['dashboard_logo'][0].filename : null;
    const background_image = req.files['background_image'] ? req.files['background_image'][0].filename : null;

    if (!sub_org_id || !sub_org_name || !id_ngage_Organization) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the id_sub_organization exists
    const checkQuery = 'SELECT * FROM tbl_sub_organizations WHERE id_sub_organization = ?';
    db.query(checkQuery, [id_sub_organization], (checkErr, checkResults) => {
        if (checkErr) {
            return res.status(500).json({ error: checkErr.message });
        }

        let query;
        let queryParams = [];
        
        if (checkResults.length > 0) {
            // Build dynamic update query
            let updateFields = [];
            
            if (sub_org_id) {
                updateFields.push('sub_org_id = ?');
                queryParams.push(sub_org_id);
            }

            if (sub_org_name) {
                updateFields.push('sub_org_name = ?');
                queryParams.push(sub_org_name);
            }

            if (id_ngage_Organization) {
                updateFields.push('id_ngage_Organization = ?');
                queryParams.push(id_ngage_Organization);
            }

            if (ngage_logo) {
                updateFields.push('ngage_logo = ?');
                queryParams.push(ngage_logo);
            }

            if (dashboard_logo) {
                updateFields.push('dashboard_logo = ?');
                queryParams.push(dashboard_logo);
            }

            if (background_image) {
                updateFields.push('background_image = ?');
                queryParams.push(background_image);
            }

            queryParams.push(id_sub_organization);

            if (updateFields.length > 0) {
                query = `
                    UPDATE tbl_sub_organizations
                    SET ${updateFields.join(', ')}, updated_datetime = NOW()
                    WHERE id_sub_organization = ?
                `;
            } else {
                return res.status(400).json({ error: 'No fields to update' });
            }

        } else {
            // Insert new record
            query = `
                INSERT INTO tbl_sub_organizations (sub_org_id, sub_org_name, updated_datetime, id_ngage_Organization, ngage_logo, dashboard_logo, background_image)
                VALUES (?, ?, NOW(), ?, ?, ?, ?)
            `;
            queryParams = [sub_org_id, sub_org_name, id_ngage_Organization, ngage_logo, dashboard_logo, background_image];
        }

        db.query(query, queryParams, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Data and images uploaded successfully' });
        });
    });
});

  
app.get('/getUsers', (req, res) => {
    const { org_id } = req.query;

    if (!org_id) {
        return res.status(400).send('Missing required query parameter: org_id');
    }

    const sql = `
        SELECT id_temp_user, org_id, name, email, phone_number, updated_datetime, isActive
        FROM tbl_temp_user
        WHERE org_id = ?
    `;

    db.query(sql, [org_id], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).send('Database query error');
        }

        if (results.length === 0) {
            return res.status(404).send('No records found');
        }

        res.json(results);
    });
});


app.post('/createAssessment', (req, res) => {
    const { Id_Assessment, Id_Game, Assessment_Title, ID_ORGANIZATION, Id_CmsUser, allow_attempt, Assessment_auto, total_questions } = req.body;

    if (Id_Assessment) {
        // Update existing assessment
        const updateSql = `UPDATE tbl_assessment 
                           SET Id_Game = ?, Assessment_Title = ?, ID_ORGANIZATION = ?, IsActive = 'A', 
                               Updated_Date_Time = NOW(), Id_CmsUser = ?, allow_attempt = ?, Previous_button = 1, 
                               Assessment_survey_type = 1, Assessment_auto = ?, total_questions = ?
                           WHERE Id_Assessment = ?`;

        db.query(updateSql, [Id_Game, Assessment_Title, ID_ORGANIZATION, Id_CmsUser, allow_attempt, Assessment_auto, total_questions, Id_Assessment], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database update failed' });
            }
            res.status(200).json({ message: 'Assessment updated successfully' });
        });
    } else {
        // Insert new assessment
        const insertSql = `INSERT INTO tbl_assessment (Id_Game, Assessment_Title, ID_ORGANIZATION, IsActive, Updated_Date_Time, Id_CmsUser, allow_attempt, Previous_button, Assessment_survey_type, Assessment_auto, total_questions)
                           VALUES (?, ?, ?, 'A', NOW(), ?, ?, 1, 1, ?, ?)`;

        db.query(insertSql, [Id_Game, Assessment_Title, ID_ORGANIZATION, Id_CmsUser, allow_attempt, Assessment_auto, total_questions], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database insertion failed' });
            }
            res.status(201).json({ message: 'Assessment created successfully', assessmentId: result.insertId });
        });
    }
});



app.get('/getAssessment', (req, res) => {
    const { ID_ORGANIZATION } = req.query;

    if (!ID_ORGANIZATION) {
        return res.status(400).json({ error: 'ID_ORGANIZATION is required' });
    }

    const selectSql = `SELECT * FROM tbl_assessment WHERE ID_ORGANIZATION = ?`;

    db.query(selectSql, [ID_ORGANIZATION], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No assessments found for the given organization ID' });
        }

        res.status(200).json(results);
    });
});


// API endpoint to submit question and options
app.post('/api/uploadquestions', (req, res) => {
    const { question, options } = req.body;

    // Check if the question already exists
    db.query('SELECT * FROM tbl_questions WHERE question_text = ?', [question], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (results.length > 0) {
            res.status(400).json({ error: 'Question already exists' });
            return;
        }

        // Insert question
        db.query('INSERT INTO tbl_questions (question_text) VALUES (?)', [question], (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            const questionId = result.insertId;

            // Insert options
            const optionValues = options.map(option => [questionId, option.text, option.is_right, option.score]);
            db.query('INSERT INTO tbl_options (question_id, option_text, is_right, score) VALUES ?', [optionValues], (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                res.json({ message: 'Question submitted successfully' });
            });
        });
    });
});

app.post('/postQuestionAnswers', (req, res) => {
    const assessments = req.body; // Expecting an array of assessment objects

    const processAssessment = (assessment, callback) => {
        const { Id_Assessment, Id_Assessment_question, assessment: assessmentDetails, answers } = assessment;

        if (Id_Assessment_question) {
            // Update existing question
            db.query(
                'UPDATE tbl_assessment_question SET Id_Assessment = ?, Assessment_Question = ?, Id_Game = ?, Assessment_Type = ?, timer = ?, assessment_question_url = ?, ID_ORGANIZATION = ?, Id_CmsUser = ? WHERE Id_Assessment_question = ?',
                [Id_Assessment, assessmentDetails.question, assessmentDetails.gameId, assessmentDetails.type, assessmentDetails.timer, assessmentDetails.questionUrl, assessmentDetails.organizationId, assessmentDetails.userId, Id_Assessment_question],
                (err, result) => {
                    if (err) return callback(err);

                    // Delete existing answers
                    db.query('DELETE FROM tbl_assessment_question_answers WHERE Id_Assessment_question = ?', [Id_Assessment_question], (err, result) => {
                        if (err) return callback(err);

                        // Insert new answers
                        const answerValues = answers.map(answer => [Id_Assessment_question, answer.description, answer.rightAns, answer.scoreCoins, assessmentDetails.organizationId, assessmentDetails.userId]);
                        db.query('INSERT INTO tbl_assessment_question_answers (Id_Assessment_question, Answer_Description, Right_Ans, Score_Coins, ID_ORGANIZATION, Id_CmsUser) VALUES ?', [answerValues], (err, result) => {
                            if (err) return callback(err);

                            callback(null);
                        });
                    });
                }
            );
        } else {
            // Insert new question
            db.query(
                'INSERT INTO tbl_assessment_question (Id_Assessment, Assessment_Question, Id_Game, Assessment_Type, timer, assessment_question_url, ID_ORGANIZATION, Id_CmsUser) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [Id_Assessment, assessmentDetails.question, assessmentDetails.gameId, assessmentDetails.type, assessmentDetails.timer, assessmentDetails.questionUrl, assessmentDetails.organizationId, assessmentDetails.userId],
                (err, result) => {
                    if (err) return callback(err);

                    const questionId = result.insertId;

                    // Insert assessment question answers
                    const answerValues = answers.map(answer => [questionId, answer.description, answer.rightAns, answer.scoreCoins, assessmentDetails.organizationId, assessmentDetails.userId]);
                    db.query('INSERT INTO tbl_assessment_question_answers (Id_Assessment_question, Answer_Description, Right_Ans, Score_Coins, ID_ORGANIZATION, Id_CmsUser) VALUES ?', [answerValues], (err, result) => {
                        if (err) return callback(err);

                        callback(null);
                    });
                }
            );
        }
    };

    const processAllAssessments = (index = 0) => {
        if (index >= assessments.length) {
            res.json({ message: 'All assessments processed successfully' });
            return;
        }

        processAssessment(assessments[index], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            processAllAssessments(index + 1);
        });
    };

    processAllAssessments();
});






// API endpoint to get assessment questions and answers based on ID_ORGANIZATION
app.get('/getQuestionAnswers/:Id_Assessment', (req, res) => {
    const { Id_Assessment } = req.params;

    // Query to fetch questions and their answers based on ID_ORGANIZATION
    const query = `
        SELECT 
            q.Id_Assessment_question,
            q.Assessment_Question,
            q.Id_Game,
            q.Assessment_Type,
            q.timer,
            q.assessment_question_url,
            q.ID_ORGANIZATION,
            q.Id_CmsUser,
            a.Id_Assessment_question_ans,
            a.Answer_Description,
            a.Right_Ans,
            a.Score_Coins,
            a.Id_CmsUser AS Answer_CmsUser
        FROM 
            tbl_assessment_question q
        LEFT JOIN 
            tbl_assessment_question_answers a
        ON 
            q.Id_Assessment_question = a.Id_Assessment_question
        WHERE 
            q.Id_Assessment = ?
    `;

    db.query(query, [Id_Assessment], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Group questions and their answers
        const response = results.reduce((acc, row) => {
            const { 
                Id_Assessment_question, 
                Assessment_Question, 
                Id_Game, 
                Assessment_Type, 
                timer, 
                assessment_question_url, 
                ID_ORGANIZATION, 
                Id_CmsUser, 
                Id_Assessment_question_ans, 
                Answer_Description, 
                Right_Ans, 
                Score_Coins, 
                Answer_CmsUser 
            } = row;

            if (!acc[Id_Assessment_question]) {
                acc[Id_Assessment_question] = {
                    Id_Assessment_question,
                    Assessment_Question,
                    Id_Game,
                    Assessment_Type,
                    timer,
                    assessment_question_url,
                    ID_ORGANIZATION,
                    Id_CmsUser,
                    answers: []
                };
            }

            acc[Id_Assessment_question].answers.push({
                Id_Assessment_question_ans,
                Answer_Description,
                Right_Ans,
                Score_Coins,
                Answer_CmsUser
            });

            return acc;
        }, {});

        res.json(Object.values(response));
    });
});


// GET API to fetch all games with Id > 9
app.get('/getAllGames', (req, res) => {
    const query = `
        SELECT * FROM tbl_game_master WHERE Id > 9`;

    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.status(200).json(results);
    });
});

// POST API to create a new game
// app.post('/api/postAddGames', upload.single('Game_Logo'), (req, res) => {
//     const { GameName, IsActive, Id_CmsUser, GameUrl } = req.body;
//     const Game_Logo = req.file ? req.file.path : null;
//     const Updated_Date_Time = new Date();

//     const query = `INSERT INTO tbl_game_master (GameName, IsActive, Updated_Date_Time, Id_CmsUser, GameUrl, Game_Logo) 
//                    VALUES (?, ?, ?, ?, ?, ?)`;
//     const values = [GameName, IsActive, Updated_Date_Time, Id_CmsUser, GameUrl, Game_Logo];

//     db.query(query, values, (err, result) => {
//         if (err) {
//             return res.status(500).send({ error: err.message });
//         }
//         res.status(201).send({ message: 'Game created successfully', gameId: result.insertId });
//     });
// });


// // POST API to create or update a game
// app.post('/api/postAddGames', upload.single('Game_Logo'), (req, res) => {
//     const { GameName, IsActive, Id_CmsUser, GameUrl, Id } = req.body;
//     const Game_Logo = req.file ? req.file.path : null;
//     const Updated_Date_Time = new Date();

//     if (Id) {
//         // Update existing record
//         const query = `UPDATE tbl_game_master SET 
//                         GameName = ?, 
//                         IsActive = ?, 
//                         Updated_Date_Time = ?, 
//                         Id_CmsUser = ?, 
//                         GameUrl = ?, 
//                         Game_Logo = ? 
//                         WHERE Id = ?`;

//         const values = [GameName, IsActive, Updated_Date_Time, Id_CmsUser, GameUrl, Game_Logo, Id];

//         db.query(query, values, (err, result) => {
//             if (err) {
//                 return res.status(500).send({ error: err.message });
//             }
//             res.status(200).send({ message: 'Game updated successfully' });
//         });
//     } else {
//         // Insert new record
//         const query = `INSERT INTO tbl_game_master (GameName, IsActive, Updated_Date_Time, Id_CmsUser, GameUrl, Game_Logo) 
//                        VALUES (?, ?, ?, ?, ?, ?)`;
//         const values = [GameName, IsActive, Updated_Date_Time, Id_CmsUser, GameUrl, Game_Logo];

//         db.query(query, values, (err, result) => {
//             if (err) {
//                 return res.status(500).send({ error: err.message });
//             }
//             res.status(201).send({ message: 'Game created successfully', gameId: result.insertId });
//         });
//     }
// });

app.post('/api/postAddGames', upload.single('Game_Logo'), (req, res) => {
    const { GameName, IsActive, Id_CmsUser, GameUrl, Id } = req.body;
    const Game_Logo = req.file ? req.file.path : null;
    const Updated_Date_Time = new Date();

    if (Id) {
        // Fetch existing data to keep the previous values for undefined fields
        const selectQuery = `SELECT * FROM tbl_game_master WHERE Id = ?`;
        db.query(selectQuery, [Id], (selectErr, result) => {
            if (selectErr || result.length === 0) {
                return res.status(500).send({ error: selectErr ? selectErr.message : 'Record not found' });
            }

            const existingRecord = result[0];

            // Update the fields only if provided, otherwise keep the existing values
            const updatedGameName = GameName || existingRecord.GameName;
            const updatedIsActive = IsActive || existingRecord.IsActive;
            const updatedIdCmsUser = Id_CmsUser || existingRecord.Id_CmsUser;
            const updatedGameUrl = GameUrl || existingRecord.GameUrl;
            const updatedGameLogo = Game_Logo || existingRecord.Game_Logo;

            const updateQuery = `UPDATE tbl_game_master SET 
                                    GameName = ?, 
                                    IsActive = ?, 
                                    Updated_Date_Time = ?, 
                                    Id_CmsUser = ?, 
                                    GameUrl = ?, 
                                    Game_Logo = ? 
                                  WHERE Id = ?`;

            const updateValues = [updatedGameName, updatedIsActive, Updated_Date_Time, updatedIdCmsUser, updatedGameUrl, updatedGameLogo, Id];

            db.query(updateQuery, updateValues, (updateErr, updateResult) => {
                if (updateErr) {
                    return res.status(500).send({ error: updateErr.message });
                }
                res.status(200).send({ message: 'Game updated successfully' });
            });
        });
    } else {
        // Insert new record
        const insertQuery = `INSERT INTO tbl_game_master (GameName, IsActive, Updated_Date_Time, Id_CmsUser, GameUrl, Game_Logo) 
                             VALUES (?, ?, ?, ?, ?, ?)`;
        const insertValues = [GameName, IsActive, Updated_Date_Time, Id_CmsUser, GameUrl, Game_Logo];

        db.query(insertQuery, insertValues, (insertErr, insertResult) => {
            if (insertErr) {
                return res.status(500).send({ error: insertErr.message });
            }
            res.status(201).send({ message: 'Game created successfully', gameId: insertResult.insertId });
        });
    }
});



// Route to get organization log by id_ngage_Organization
app.get('/organization/:id', (req, res) => {
    const id = req.params.id;

    const query = `
        SELECT organization_name,Logo 
        FROM tbl_ngage_organization 
        WHERE id_ngage_Organization = ?
    `;

    db.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.json(results[0]);
    });
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




// const httpsOptions = {
// key: fs.readFileSync('/opt/bitnami/letsencrypt/certificates/n-gage.co.in.key'),
// cert: fs.readFileSync('/opt/bitnami/letsencrypt/certificates/n-gage.co.in.crt'),

// };

// const server = https.createServer(httpsOptions, app).listen(8000, () => {
// console.log("Server running on https://localhost:8000/");
// });
